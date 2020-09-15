import {
    Resolver,
    Arg,
    Field,
    Mutation,
    Ctx,
    ObjectType,
    Query,
} from 'type-graphql';
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME } from '../constants';
import { UsernameEmailPasswordInput } from './UsernameEmailPasswordInput';
import { validateRegister } from '../utils/validateRegister';

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
};

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { em }: MyContext
    ) {
        // const user = await em.findOne(User, { email });
        return true;
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, em }: MyContext
    ) {
        // Not logged in
        if (!req.session.userId) {
            return null;
        }

        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernameEmailPasswordInput,
        @Ctx() { em, req }: MyContext
        ) : Promise<UserResponse> {
            const errors = validateRegister(options);
            if (errors) {
                return { errors };
            }

            const hashedPassword = await argon2.hash(options.password);
            let user;
            try {
              const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery()
                .insert({
                  username: options.username,
                  email: options.email,
                  password: hashedPassword,
                  created_at: new Date(),
                  updated_at: new Date(),
                })
                .returning("*");
              user = result[0];
            } catch(error) {
                // ERROR: Duplicate username
                if (error.code === '23505') { // || error.detail.includes('already exists')) {
                    return {
                        errors: [
                            {
                                field: 'username',
                                message: 'Ce nom d\'utilisateur existe déjà.',
                            },
                        ],
                    };
                }
            };

            // Login after register (store userId in session - set cookie of user)
            req.session.userId = user.id;

            return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
        ) : Promise<UserResponse> {
            const user = await em.findOne(User,
                usernameOrEmail.includes('@') ?
                { email: usernameOrEmail }
                : { username: usernameOrEmail }
                );
            if (!user) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'Cet utilisateur n\'existe pas.',
                        },
                    ],
                };
            }
            const valid = await argon2.verify(user.password, password);
            if (!valid) {
                return {
                    errors: [
                        {
                            field: 'password',
                            message: 'Nom d\'utilisateur ou mot de passe incorrect.',
                        },
                    ],
                };
            }

            req.session.userId = user.id;

            return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) =>
            req.session.destroy((error) => {
                res.clearCookie(COOKIE_NAME);
                if (error) {
                    console.log(error);
                    resolve(false);
                    return;
                }

                resolve(true);
            })
        );
    }
};
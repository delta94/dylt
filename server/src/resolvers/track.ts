import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  ObjectType,
} from "type-graphql";
import { Track } from "../entities/Track";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class TrackInput {
  @Field()
  name: string;

  @Field()
  url: string;
}

@ObjectType()
class PaginatedTracks {
  @Field(() => [Track])
  tracks: Track[];

  @Field()
  hasMore: boolean;
}

@Resolver()
export class TrackResolver {
  // Find all tracks
  @Query(() => PaginatedTracks)
  async tracks(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedTracks> {
    // Fetch 1 more track
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const tracks = await getConnection().query(
      `
    select t.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator
    from track t
    inner join public.user u on u.id = t."creatorId"
    ${cursor ? `where t."createdAt" < $2` : ""}
    order by t."createdAt" DESC
    limit $1
    `,
      replacements
    );

    // const queryBuiler = getConnection()
    //   .getRepository(Track)
    //   .createQueryBuilder("t")
    //   .innerJoinAndSelect(
    //     't.creator',
    //     'user',
    //     'user.id = t."creatorId"',
    //   )
    //   .orderBy('t."createdAt"', "DESC")
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   queryBuiler.where('t."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const tracks = await queryBuiler.getMany();

    console.log('tracks: ', tracks);

    // Fetch 1 more track to check if hasMore === true
    // else end of tracks
    return {
      tracks: tracks.slice(0, realLimit),
      hasMore: tracks.length === realLimitPlusOne,
    };
  }

  // Find track by id
  @Query(() => Track, { nullable: true })
  track(@Arg("id") id: number): Promise<Track | undefined> {
    return Track.findOne(id);
  }

  // Create new track
  @Mutation(() => Track)
  @UseMiddleware(isAuth)
  async createTrack(
    @Arg("input") input: TrackInput,
    @Ctx() { req }: MyContext
  ): Promise<Track> {
    return Track.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  // Find update track by id
  @Mutation(() => Track, { nullable: true })
  async updateTrack(
    @Arg("id") id: number,
    @Arg("name", () => String, { nullable: true }) name: string
  ): Promise<Track | null> {
    const track = await Track.findOne(id);
    if (!track) {
      return null;
    }
    if (typeof name !== "undefined") {
      await Track.update({ id }, { name });
    }
    return track;
  }

  // Delete track by id
  @Mutation(() => Boolean)
  async deleteTrack(@Arg("id") id: number): Promise<boolean> {
    await Track.delete(id);
    return true;
  }
}

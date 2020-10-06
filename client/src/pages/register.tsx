import React, { useState } from 'react';
import { Form, Input, Button, Typography, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRegisterMutation } from '../generated/graphql';
import { useRouter } from 'next/router';

import '../styles/components/register.less';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { errorProps } from '../types/types';

const { Title } = Typography;

type formProps = {
    username: string;
    email: string;
    password: string;
    confirm: string;
};

const Register = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<errorProps | undefined>(undefined);

    const [, register] = useRegisterMutation();
    const router = useRouter();

    const onFinish = async (values: formProps) => {
        setLoading(true);
        console.log('Received values of form: ', values);
        const response = await register({ options: values });
        // On error
        console.log(response);
        if (response.data?.register.errors) {
            setLoading(false);
            console.log(response.data.register.errors);
            setError(response.data.register.errors[0]);
            // TODO: setFields error (username taken, password length too short, etc)
            // On success
        } else if (response.data?.register.user) {
            setLoading(false);
            router.push('/');
        }
    };

    return (
        <>
            <Title style={{ textAlign: 'center', color: '#f3f5f9' }}>Inscription</Title>
            <Form
                {...formItemLayout}
                form={form}
                layout="vertical"
                className="register-form"
                onFinish={onFinish}
                scrollToFirstError
            >
                <Form.Item
                    name="username"
                    label={
                        <span>
                            Nom d'utilisateur&nbsp;
                            <Tooltip title="Comment voulez-vous que les autres vous appellent ?">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Veuillez entrer votre nom d'utilisateur !",
                            whitespace: true,
                        },
                    ]}
                    {...(error?.field === 'username' && {
                        validateStatus: 'error',
                        help: error?.message,
                    })}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="E-mail"
                    rules={[
                        {
                            type: 'email',
                            message: 'Adresse e-mail non valide !',
                        },
                        {
                            required: true,
                            message: 'Veuillez saisir votre adresse e-mail !',
                        },
                    ]}
                    {...(error?.field === 'email' && {
                        validateStatus: 'error',
                        help: error?.message,
                    })}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mot de passe"
                    rules={[
                        {
                            required: true,
                            message: 'Veuillez saisir votre mot de passe !',
                        },
                    ]}
                    hasFeedback
                    {...(error?.field === 'password' && {
                        validateStatus: 'error',
                        help: error?.message,
                    })}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    label="Confirmer le mot de passe"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Veuillez confirmer votre mot de passe !',
                        },
                        ({ getFieldValue }) => ({
                            validator(rule, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }

                                return Promise.reject(
                                    'Les deux mots de passe que vous avez saisis ne correspondent pas !',
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        S'inscrire
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 8,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 16,
        },
    },
};

export default withUrqlClient(createUrqlClient)(Register);

import React, { useState } from 'react'
import {
    Form,
    Input,
    Button,
    Typography,
    // Checkbox,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLoginMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import Link from 'next/link';

const { Title } = Typography;

import '../styles/components/login.less';


// interface loginProps {
// }

type formProps = {
    username: string,
    email: string,
    password: string,
    confirm: string,
}

const Login: React.FC<{}> = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    // const [errors, setErrors] = useState([]);

    const [, login] = useLoginMutation();
    const router = useRouter();

    const onFinish = async (values: formProps) => {
        setLoading(true);
        console.log('Received values of form: ', values);
        const response = await login({ options: values });
        console.log(response);
        // On error
        if (response.data?.login.errors) {
            setLoading(false);
            console.log(response.data.login.errors)
            // TODO: setFields error (username taken, password length too short, etc)
            // On success
        } else if (response.data?.login.user) {
            setLoading(false);
            router.push('/');
        };
    };


    return (
        <>
            <Title style={{ textAlign: 'center', color: '#f3f5f9' }}>Connexion</Title>
            <Form
                name="normal_login"
                className="login-form"
                // initialValues={{ remember: true }}
                onFinish={onFinish}
                scrollToFirstError
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur !' }]}
                >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Nom d'utilisateur" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Veuillez confirmer votre mot de passe !' }]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Mot de passe"
                    />
                </Form.Item>
                <Form.Item>
                    {/* <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Se souvenir de moi</Checkbox>
                    </Form.Item> */}

                    <Link href="">
                        <a className="login-form-forgot">
                            Mot de passe oublié ?
                        </a>
                    </Link>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
                        Se connecter
        </Button>
        Ou <Link href="/register">S'inscrire maintenant !</Link>
                </Form.Item>
            </Form>
        </>
    );
}

export default Login;
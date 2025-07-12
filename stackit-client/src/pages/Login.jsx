import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async e => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border p-2 w-full rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border p-2 w-full rounded"
                />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">
                    Login
                </button>
                <p className="text-sm mt-3">
                    Don’t have an account?{' '}
                    <Link to="/signup" className="text-indigo-600 hover:underline">
                        Sign up here
                    </Link>
                </p>

            </form>
        </div>
    );
};

export default Login;

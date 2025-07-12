import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'react-quill/dist/quill.snow.css'; // ✅ required
import RichTextEditor from '../components/RichTextEditor';
import { getAISuggestion } from '../utils/cohere';

const AskQuestion = () => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [tags, setTags] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [tagInput, setTagInput] = useState('');
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAISuggestion = async () => {
        setLoadingSuggestion(true);
        const prompt = `Generate a suitable question title for the following description:\n\n${desc}\n\nTitle:`;
        const suggestedTitle = await getAISuggestion(prompt);
        setTitle(suggestedTitle);
        setLoadingSuggestion(false);
    };

    const handleTagAdd = () => {
        const newTag = tagInput.trim();
        if (
            newTag &&
            !tags.includes(newTag.toLowerCase()) &&
            tags.length < 5
        ) {
            setTags([...tags, newTag.toLowerCase()]);
            setTagInput('');
        }
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async () => {
        if (!title || !desc || !tags) {
            toast.error("All fields are required.");
            return;
        }

        const rawTags = tags
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);

        const uniqueTags = [...new Set(rawTags)];

        if (uniqueTags.length > 5) {
            return toast.error('You can only add up to 5 unique tags.');
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'questions'), {
                title,
                description: desc,
                tags: tags.split(',').map(tag => tag.trim()),
                userId: currentUser.uid,
                username: currentUser.email,
                createdAt: Timestamp.now(),
                answerCount: 0
            });

            toast.success("Question posted successfully!");
            setTitle('');
            setDesc('');
            setTags('');
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[40rem] py-10 px-4 flex justify-center items-center">
            <div className="max-w-4xl w-full p-6 py-8 bg-gradient-to-br from-indigo-100 to-gray-300 shadow-xl rounded-lg">
                <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Ask a New Question</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[1rem] font-semibold text-gray-700 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. How do I use useEffect in React?"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[1rem] font-semibold text-gray-700 mb-1">Description</label>
                        <RichTextEditor
                            value={desc}
                            onChange={setDesc}
                            placeholder="Explain your question with examples and details..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAISuggestion}
                            disabled={loadingSuggestion || !desc}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingSuggestion ? "Generating..." : "Suggest Title with AI"}
                        </button>
                    </div>

                    <div>
                        <label className="block text-[1rem] font-semibold text-gray-700 mb-1">Tags</label>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="react, firebase, hooks"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate tags with commas. (e.g. HTML, JavaScript, CSS)</p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-indigo-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : 'Submit Question'}
                        </button>
                    </div>

                    {loading && <p className="text-sm text-gray-500 text-center">Submitting your question...</p>}
                </div>
            </div>
        </div>
    );
};

export default AskQuestion;

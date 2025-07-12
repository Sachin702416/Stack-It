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

    // 🔐 Redirect if not logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !desc || !tags) return toast.error("All fields are required.");

        const rawTags = tags
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);

        const uniqueTags = [...new Set(rawTags)];

        if (uniqueTags.length > 5) {
            return alert('You can only add up to 5 unique tags.');
        }

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
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Try again.");
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Ask a New Question</h2>

            <input
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                }}
                placeholder="Enter a descriptive title"
                className="w-full mb-3 p-2 border rounded"
            />
            <RichTextEditor
                value={desc}
                onChange={setDesc}
                placeholder="Write your Questions here..."
            />
            <button
                onClick={handleAISuggestion}
                disabled={loadingSuggestion}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-3"
            >
                {loadingSuggestion ? "Generating..." : "Suggest Title with AI"}
            </button>

            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="AI suggested title will appear here"
                className="w-full mb-3 p-2 border rounded"
            />

            <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter comma-separated tags"
                className="w-full mb-3 p-2 border rounded"
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`bg-indigo-600 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Submitting...' : 'Submit Question'}
            </button>

            {loading && <p className="text-sm text-gray-500 mt-2">Submitting your question...</p>}
        </div>
    );
};

export default AskQuestion;

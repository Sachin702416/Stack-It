import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const { user } = useAuth(); // 🟡 Make sure you're using `user`, not `currentUser`
  const navigate = useNavigate();

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (!title || !desc || !tags) return alert('All fields are required.');

    await addDoc(collection(db, 'questions'), {
  title,
  description: desc,
  tags: tags.split(',').map(tag => tag.trim()),
  userId: user.uid,
  username: user.email,
  createdAt: Timestamp.now(),
  answerCount: 0    // ✅ Added
});


    // Clear form and redirect
    setTitle('');
    setDesc('');
    setTags('');
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ask a New Question</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a descriptive title"
        className="w-full mb-3 p-2 border rounded"
      />

      <ReactQuill
        value={desc}
        onChange={setDesc}
        className="mb-3"
        placeholder="Describe your question in detail"
      />

      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Enter comma-separated tags"
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Submit Question
      </button>
    </div>
  );
};

export default AskQuestion;

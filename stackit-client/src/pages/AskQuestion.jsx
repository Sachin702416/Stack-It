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
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async () => {
    if (!title || !desc || !tags) {
      alert('All fields are required.');
      return;
    }

    await addDoc(collection(db, 'questions'), {
      title,
      description: desc,
      tags: tags.split(',').map(tag => tag.trim()),
      userId: currentUser.uid,
      username: currentUser.email,
      createdAt: Timestamp.now(),
      answerCount: 0
    });

    setTitle('');
    setDesc('');
    setTags('');
    navigate('/');
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
            <ReactQuill
              value={desc}
              onChange={setDesc}
              placeholder="Explain your question with examples and details..."
              className="bg-white"
            />
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
              className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Submit Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;

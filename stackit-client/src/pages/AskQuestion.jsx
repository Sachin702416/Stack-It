import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Delay loading editor to avoid findDOMNode error in React 18
    setEditorLoaded(true);
  }, []);

  const handleSubmit = async () => {
    if (!title || !desc || !tags) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await addDoc(collection(db, 'questions'), {
        title,
        description: desc,
        tags: tags.split(',').map(tag => tag.trim()),
        userId: user.uid,
        username: user.email,
        createdAt: serverTimestamp()
      });

      // Reset form & redirect
      setTitle('');
      setDesc('');
      setTags('');
      navigate('/');
    } catch (err) {
      console.error("Error submitting question:", err);
    }
  };

  if (!user) return <p className="p-6 text-center">Please log in to ask a question.</p>;

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold text-indigo-700">Ask a New Question</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a short title"
        className="w-full border p-2 rounded"
      />

      {editorLoaded && (
        <ReactQuill
          value={desc}
          onChange={setDesc}
          className="bg-white"
          theme="snow"
        />
      )}

      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated, e.g., react, firebase)"
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Submit Question
      </button>
    </div>
  );
};

export default AskQuestion;

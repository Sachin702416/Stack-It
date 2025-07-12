import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async () => {
    await addDoc(collection(db, 'questions'), {
      title,
      description: desc,
      tags: tags.split(',').map(tag => tag.trim()),
      userId: currentUser.uid,
      username: currentUser.email,
      createdAt: Timestamp.now()
    });
    setTitle('');
    setDesc('');
    setTags('');
  };

  return (
    <div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <ReactQuill value={desc} onChange={setDesc} />
      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default AskQuestion;
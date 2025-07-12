// 📁 src/pages/TagPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';

const TagPage = () => {
  const { tag } = useParams();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestionsByTag = async () => {
      const q = query(collection(db, 'questions'), where('tags', 'array-contains', tag));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);
    };
    fetchQuestionsByTag();
  }, [tag]);

  return (
    <div className="p-4 sm:px-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        Questions tagged: #{tag}
      </h2>

      {questions.length === 0 ? (
        <p className="text-gray-600">No questions found for this tag.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="border-b pb-2">
              <Link to={`/question/${q.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                {q.title}
              </Link>
              <p className="text-sm text-gray-600">By {q.username}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagPage;

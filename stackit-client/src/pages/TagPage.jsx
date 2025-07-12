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
    <div className="min-h-screen py-10 px-4 flex justify-center">
      <div className="w-full max-w-5xl bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">
          Questions tagged: <span className="text-purple-600">#{tag}</span>
        </h2>

        {questions.length === 0 ? (
          <p className="text-gray-600 text-lg">No questions found for this tag.</p>
        ) : (
          <ul className="space-y-6">
            {questions.map((q) => (
              <li
                key={q.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200"
              >
                <Link
                  to={`/question/${q.id}`}
                  className="text-xl font-semibold text-indigo-700 hover:underline"
                >
                  {q.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">Asked by {q.username || 'Unknown user'}</p>
                {q.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {q.tags.map((tagItem, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
                      >
                        #{tagItem}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagPage;

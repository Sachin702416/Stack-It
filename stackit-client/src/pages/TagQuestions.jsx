import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const TagQuestions = () => {
  const { tag } = useParams();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchTaggedQuestions = async () => {
      const q = query(
        collection(db, 'questions'),
        where('tags', 'array-contains', tag)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);
    };
    fetchTaggedQuestions();
  }, [tag]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">
        Questions tagged <span className="text-indigo-600">#{tag}</span>
      </h2>
      {questions.length === 0 ? (
        <p>No questions found for this tag.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} className="border-b py-3">
            <Link to={`/question/${q.id}`} className="text-lg font-semibold text-indigo-700 hover:underline">
              {q.title}
            </Link>
            <p className="text-sm text-gray-600">By {q.username}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default TagQuestions;

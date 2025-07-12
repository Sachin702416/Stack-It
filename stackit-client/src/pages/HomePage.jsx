import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('newest');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, [filter, searchText]);

  const fetchQuestions = async () => {
    try {
      let q = collection(db, 'questions');

      if (filter === 'newest') {
        q = query(q, orderBy('createdAt', 'desc'));
      } else if (filter === 'unanswered') {
        q = query(q, where('answerCount', '==', 0), orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Simple client-side search (for demo)
      if (searchText.trim()) {
        const lower = searchText.toLowerCase();
        data = data.filter(q =>
          q.title.toLowerCase().includes(lower) || q.description.toLowerCase().includes(lower)
        );
      }

      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ✅ Desktop Filters */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/ask')}
        >
          Ask New Question
        </button>

        <div className="flex items-center gap-2">
          <select
            className="border px-2 py-1 rounded text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="unanswered">Unanswered</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            className="border px-2 py-1 rounded text-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Mobile Filters */}
      <div className="block md:hidden space-y-3 mb-6">
        <button
          className="bg-indigo-500 text-white w-full px-4 py-2 rounded"
          onClick={() => navigate('/ask')}
        >
          Ask New Question
        </button>

        <select
          className="border px-2 py-1 w-full rounded text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="unanswered">Unanswered</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          className="border px-2 py-1 w-full rounded text-sm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* ✅ Question List */}
      <div className="mt-6">
        {questions.length > 0 ? (
          questions.map(q => (
            <div key={q.id} className="border-b py-4">
              <Link
                to={`/question/${q.id}`}
                className="text-blue-600 font-medium hover:underline"
              >
                {q.title}
              </Link>
              <p className="text-sm text-gray-600">
                {q.description?.slice(0, 100)}...
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No questions found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;

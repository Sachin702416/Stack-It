import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [questions, setQuestions] = useState([]);
    const [filter, setFilter] = useState('newest');
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchQuestions();
    }, [filter, searchText]);

    let qRef = collection(db, 'questions');

    const fetchQuestions = async () => {
        try {
            setLoading(true); // Start loading
            let q = collection(db, 'questions');

            if (filter === 'newest') {
                q = query(q, orderBy('createdAt', 'desc'));
            } else if (filter === 'unanswered') {
                q = query(q, where('answerCount', '==', 0), orderBy('createdAt', 'desc'));
            }

            const snapshot = await getDocs(q);
            let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (searchText.trim()) {
                const lower = searchText.toLowerCase();
                data = data.filter(q =>
                    q.title.toLowerCase().includes(lower) || q.description.toLowerCase().includes(lower)
                );
            }

            setQuestions(data);
        } catch (err) {
            console.error('Error fetching questions:', err);
        } finally {
            setLoading(false); // End loading
        }
    };


    const [tagFilter, setTagFilter] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // Start loading
                let q = query(collection(db, 'questions'), orderBy('createdAt', 'desc', sortOrder));
                const snap = await getDocs(q);
                let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (tagFilter) {
                    data = data.filter(q => q.tags.includes(tagFilter));
                }

                setQuestions(data);
            } catch (err) {
                console.error('Error fetching tag-filtered questions:', err);
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchData();
    }, [sortOrder, tagFilter]);

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="desc">Newest</option>
                        <option value="asc">Oldest</option>
                    </select>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {['React', 'Firebase', 'JWT', 'Tailwind'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setTagFilter(tag)}
                                className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-indigo-100"
                            >
                                <Link to={`/tag/${tag}`} className="text-blue-500 hover:underline">
                                    #{tag}
                                </Link>
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border px-3 py-2 rounded w-full md:w-64 text-sm"
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
                    className="border px-2 py-1 rounded text-sm"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="desc">Newest</option>
                    <option value="asc">Oldest</option>
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
                {loading ? (
                    <p className="text-center text-gray-500 py-6">Loading questions...</p>
                ) : filteredQuestions.length === 0 ? (
                    <p className="text-gray-500 mt-4">No matching questions found.</p>
                ) : (
                    filteredQuestions.map((q) => (
                        <div key={q.id} className="border-b py-3">
                            <Link to={`/question/${q.id}`} className="text-lg font-semibold text-indigo-700 hover:underline">
                                {q.title}
                            </Link>
                            <p className="text-sm text-gray-600">By {q.username}</p>

                            {/* 👇 ADD THIS BELOW USERNAME */}
                            <p className="text-xs text-gray-500 mt-1">
                                {q.answerCount || 0} {q.answerCount === 1 ? 'answer' : 'answers'}
                            </p>
                        </div>
                    ))

                )}

            </div>
        </div>
    );
};

export default HomePage;

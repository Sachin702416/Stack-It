import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const HomePage = () => {
    const [questions, setQuestions] = useState([]);
    const [filter, setFilter] = useState('newest');
    const [searchText, setSearchText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [tagFilter, setTagFilter] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);

                let baseQuery = collection(db, 'questions');

                // Decide sort order from filter
                let sortOrder = 'desc';
                if (filter === 'oldest') sortOrder = 'asc';

                // Compose Firebase query
                let q;
                if (filter === 'unanswered') {
                    q = query(baseQuery, where('answerCount', '==', 0), orderBy('createdAt', sortOrder));
                } else {
                    q = query(baseQuery, orderBy('createdAt', sortOrder));
                }

                const snapshot = await getDocs(q);
                let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Apply tag filter if any
                if (tagFilter) {
                    data = data.filter(q => q.tags?.includes(tagFilter));
                }

                // Apply search filter
                if (searchQuery.trim()) {
                    const lower = searchQuery.toLowerCase();
                    data = data.filter(q =>
                        q.title.toLowerCase().includes(lower) || q.description?.toLowerCase().includes(lower)
                    );
                }

                setQuestions(data);
            } catch (err) {
                console.error('Error fetching questions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [filter, tagFilter, searchQuery]);

    return (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-4 py-5">
            
            <div className='flex flex-col mb-4'  >

                <div className="bg-gradient-to-r from-indigo-300 via-indigo-300 to-indigo-300 p-6 rounded-t-lg  mb-0">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h1 className="text-3xl font-bold text-indigo-900">Community Questions</h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-between items-center gap-4 pb-6 bg-gradient-to-r from-indigo-300 via-indigo-300 to-indigo-300 rounded-b-lg px-6 p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            className="border border-indigo-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="desc">Newest</option>
                            <option value="asc">Oldest</option>
                        </select>

                        <select
                            className="border border-indigo-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="newest">All</option>
                            <option value="unanswered">Unanswered</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-indigo-300 px-4 py-2 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    {/* ask question button */}
                    <button
                        className="bg-green-600 hover:scale-105 text-white px-6 py-2 rounded-lg text-md font-medium shadow-lg"
                        onClick={() => navigate('/ask')}
                    >
                        Ask a Question
                    </button>

                </div>

            </div>

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['React', 'Firebase', 'JWT', 'Tailwind'].map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setTagFilter(tag)}
                        className={`px-4 py-1 rounded-full text-sm border shadow-sm ${
                            tagFilter === tag ? 'bg-indigo-200 text-indigo-800 border-indigo-400' : 'bg-gray-500 text-gray-50 border-gray-300'
                        } hover:bg-indigo-100 transition`}
                    >
                        #{tag}
                    </button>
                ))}
                {tagFilter && (
                    <button
                        onClick={() => setTagFilter(null)}
                        className="text-sm text-red-500 hover:underline ml-2"
                    >
                        Clear tag filter
                    </button>
                )}
            </div>

            {/* Question List */}
            <div>
                {loading ? (
                    <p className="text-center text-indigo-500 animate-pulse text-lg">Loading questions...</p>
                ) : filteredQuestions.length === 0 ? (
                    <p className="text-center text-gray-500">No questions found.</p>
                ) : (
                    <div className="space-y-5">
                        {filteredQuestions.map((q) => (
                            <div
                                key={q.id}
                                className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md bg-gray-50 transition duration-200"
                            >
                                <Link
                                    to={`/question/${q.id}`}
                                    className="text-xl font-semibold text-indigo-700 hover:underline"
                                >
                                    {q.title}
                                </Link>
                                <p className="text-sm text-gray-600 mt-1">By {q.username}</p>
                                {q.createdAt && (
                                    <p className="text-xs text-gray-400">
                                        {formatDistanceToNow(q.createdAt.toDate())} ago
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {q.answerCount || 0} {q.answerCount === 1 ? 'answer' : 'answers'}
                                </p>
                                <Link to={`/question/${q.id}`}>
                                    <button className='text-sm font-medium px-2.5 pb-0.5 bg-indigo-500 hover:scale-105 text-white mt-2.5 rounded-md'>
                                        view answer
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
  
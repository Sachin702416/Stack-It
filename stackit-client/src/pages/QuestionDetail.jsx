import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    doc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuestionDetail = () => {
    const { id } = useParams(); // Question ID from URL
    const [question, setQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [answers, setAnswers] = useState([]);
    const { currentUser } = useAuth();

    // 🔹 Fetch question details
    useEffect(() => {
        const fetchQuestion = async () => {
            const docRef = doc(db, 'questions', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setQuestion({ id: docSnap.id, ...docSnap.data() });
            }
        };
        fetchQuestion();
    }, [id]);

    // 🔹 Real-time listener for answers
    useEffect(() => {
        const q = query(collection(db, 'questions', id, 'answers'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAnswers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [id]);

    // 🔹 Submit new answer
    const handleAnswerSubmit = async () => {
        if (!currentUser) return alert("Login required to answer.");
        if (!answerText) return;

        await addDoc(collection(db, 'questions', id, 'answers'), {
  text: answerText,
  createdAt: new Date(),
  userId: currentUser.uid,
  username: currentUser.email,
  upvotes: 0,
  downvotes: 0,
  isAccepted: false
});

// 🔼 Increment answer count
await updateDoc(doc(db, 'questions', id), {
  answerCount: increment(1)
})};


    // 🔹 Mark answer as accepted
    const handleAccept = async (answerId) => {
        await updateDoc(doc(db, 'questions', id, 'answers', answerId), {
            isAccepted: true
        });
        await updateDoc(doc(db, 'questions', id), {
            isSolved: true
        });
    };

    // 🔹 Upvote or Downvote
    const handleVote = async (answerId, type) => {
        const answerRef = doc(db, 'questions', id, 'answers', answerId);
        await updateDoc(answerRef, {
            [type]: increment(1)
        });
    };

    return (
        <div className="px-4 sm:px-8 md:px-16 py-6">
            {question ? (
                <>
                    <h1 className="text-2xl font-bold text-indigo-600 mb-2">{question.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: question.description }} className="mb-4 text-gray-800" />

                    <div className="flex flex-wrap gap-2 mb-6">
                        {question.tags?.map(tag => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <hr className="my-6" />

                    <h2 className="text-xl font-semibold mb-4">Answers ({answers.length})</h2>
                    {answers.map(ans => (
                        <div key={ans.id} className="border-b py-3">
                            <div dangerouslySetInnerHTML={{ __html: ans.text }} className="text-gray-800 mb-2" />
                            <p className="text-sm text-gray-500">– {ans.username}</p>

                            {/* Voting buttons */}
                            <div className="flex gap-4 mt-2 text-sm items-center">
                                <button
                                    onClick={() => handleVote(ans.id, 'upvotes')}
                                    className="text-green-600 hover:underline"
                                >
                                    👍 {ans.upvotes}
                                </button>

                                <button
                                    onClick={() => handleVote(ans.id, 'downvotes')}
                                    className="text-red-500 hover:underline"
                                >
                                    👎 {ans.downvotes}
                                </button>
                            </div>

                            {/* Accepted Answer Badge */}
                            {ans.isAccepted && (
                                <p className="text-green-600 font-semibold text-sm mt-1">✔ Accepted Answer</p>
                            )}

                            {/* Accept Answer Button */}
                            {currentUser?.uid === question.userId && !ans.isAccepted && (
                                <button
                                    onClick={() => handleAccept(ans.id)}
                                    className="text-green-500 text-sm hover:underline mt-1"
                                >
                                    Mark as Accepted
                                </button>
                            )}
                        </div>
                    ))}

                    <hr className="my-6" />

                    {currentUser ? (
                        <>
                            <h2 className="text-lg font-semibold mb-2">Your Answer</h2>
                            <ReactQuill
                                value={answerText}
                                onChange={setAnswerText}
                                modules={{
                                    toolbar: [
                                        ['bold', 'italic', 'strike'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        ['link', 'image'],
                                        [{ align: [] }],
                                        ['emoji']
                                    ]
                                }}
                                formats={[
                                    'bold', 'italic', 'strike', 'list', 'bullet', 'link', 'image', 'align', 'emoji'
                                ]}
                            />
                            <button
                                onClick={handleAnswerSubmit}
                                className="mt-3 bg-indigo-500 text-white px-4 py-2 rounded"
                            >
                                Submit Answer
                            </button>
                        </>
                    ) : (
                        <p className="text-sm text-gray-600">Login to post an answer.</p>
                    )}
                </>
            ) : (
                <p>Loading question...</p>
            )}
        </div>
    );
};

export default QuestionDetail;

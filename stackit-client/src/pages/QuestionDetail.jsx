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
    deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';

const QuestionDetail = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [answers, setAnswers] = useState([]);
    const { currentUser } = useAuth();
    const [editingAnswerId, setEditingAnswerId] = useState(null);
    const [editedText, setEditedText] = useState('');

    useEffect(() => {
        const fetchQuestion = async () => {
            const docRef = doc(db, 'questions', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setQuestion({
                    id: docSnap.id,
                    ...docSnap.data(),
                    tags: Array.isArray(docSnap.data().tags) ? docSnap.data().tags : [],
                });
            }
        };
        fetchQuestion();
    }, [id]);

    useEffect(() => {
        const q = query(collection(db, 'questions', id, 'answers'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAnswers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [id]);

    const handleAnswerSubmit = async () => {
        if (!currentUser) {
            toast.error("Login required to answer.");
            return;
        }
        if (!answerText) {
            toast.error("Answer cannot be empty.");
            return;
        }

        try {
            await addDoc(collection(db, 'questions', id, 'answers'), {
                text: answerText,
                createdAt: new Date(),
                userId: currentUser.uid,
                username: currentUser.email,
                upvotes: 0,
                downvotes: 0,
                isAccepted: false
            });

            await updateDoc(doc(db, 'questions', id), {
                answerCount: increment(1)
            });

            toast.success("Answer submitted successfully!");
            setAnswerText('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit answer. Try again.");
        }
    };

    const handleAccept = async (answerId) => {
        try {
            await updateDoc(doc(db, 'questions', id, 'answers', answerId), {
                isAccepted: true
            });
            await updateDoc(doc(db, 'questions', id), {
                isSolved: true
            });
            toast.success("Answer marked as accepted!");
        } catch (err) {
            toast.error("Error marking as accepted.");
            console.error(err);
        }
    };

    const handleVote = async (answerId, type) => {
        try {
            const answerRef = doc(db, 'questions', id, 'answers', answerId);
            await updateDoc(answerRef, {
                [type]: increment(1)
            });
            toast.success(type === 'upvotes' ? "Upvoted!" : "Downvoted!");
        } catch (error) {
            toast.error("Failed to vote.");
        }
    };

    const handleUpdateAnswer = async (answerId) => {
        if (!editedText.trim()) {
            toast.error("Answer cannot be empty.");
            return;
        }

        try {
            const answerRef = doc(db, 'questions', id, 'answers', answerId);
            await updateDoc(answerRef, {
                text: editedText
            });
            toast.success("Answer updated!");
            setEditingAnswerId(null);
            setEditedText('');
        } catch (err) {
            toast.error("Update failed.");
            console.error(err);
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this answer?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'questions', id, 'answers', answerId));

            await updateDoc(doc(db, 'questions', id), {
                answerCount: increment(-1)
            });

            toast.success("Answer deleted!");
        } catch (err) {
            toast.error("Delete failed.");
            console.error(err);
        }
    };

    return (
        <div className="px-4 sm:px-8 md:px-16 py-6">
            {question ? (
                <>
                    <h1 className="text-2xl font-bold text-indigo-600 mb-2">{question.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: question.description }} className="mb-4 text-gray-800" />

                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {Array.isArray(question.tags) ? (
                                question.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">
                                        #{tag}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400">No tags</p>
                            )}
                        </div>
                    </div>

                    <hr className="my-6" />

                    <h2 className="text-xl font-semibold mb-4">Answers ({answers.length})</h2>
                    {answers.map(ans => (
                        <div key={ans.id} className="border-b py-3">
                            {editingAnswerId === ans.id ? (
                                <>
                                    <RichTextEditor value={editedText} onChange={setEditedText} />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleUpdateAnswer(ans.id)}
                                            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingAnswerId(null);
                                                setEditedText('');
                                            }}
                                            className="bg-gray-300 text-black px-3 py-1 rounded text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div dangerouslySetInnerHTML={{ __html: ans.text }} className="text-gray-800 mb-2" />
                                    <p className="text-sm text-gray-500">– {ans.username}</p>
                                    {ans.createdAt && (
                                        <p className="text-xs text-gray-400">
                                            Answered {formatDistanceToNow(ans.createdAt.toDate())} ago
                                        </p>
                                    )}

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

                                    {ans.isAccepted && (
                                        <p className="text-green-600 font-semibold text-sm mt-1">✔ Accepted Answer</p>
                                    )}

                                    {currentUser?.uid === question.userId && !ans.isAccepted && (
                                        <button
                                            onClick={() => handleAccept(ans.id)}
                                            className="text-green-500 text-sm hover:underline mt-1"
                                        >
                                            Mark as Accepted
                                        </button>
                                    )}

                                    {currentUser?.uid === ans.userId && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    setEditingAnswerId(ans.id);
                                                    setEditedText(ans.text);
                                                }}
                                                className="text-blue-500 text-sm hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAnswer(ans.id)}
                                                className="text-red-500 text-sm hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}

                    <hr className="my-6" />

                    {currentUser ? (
                        <>
                            <h2 className="text-lg font-semibold mb-2">Your Answer</h2>
                            <RichTextEditor
                                value={answerText}
                                onChange={setAnswerText}
                                placeholder="Write your answer here..."
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

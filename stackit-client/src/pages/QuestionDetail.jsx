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
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answers, setAnswers] = useState([]);
  const { currentUser } = useAuth();

  /* 🔹 Fetch question */
  useEffect(() => {
    const fetchQuestion = async () => {
      const docRef = doc(db, 'questions', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setQuestion({
          id: snap.id,
          ...snap.data(),
          tags: Array.isArray(snap.data().tags) ? snap.data().tags : [],
        });
      }
    };
    fetchQuestion();
  }, [id]);

  /* 🔹 Live answers */
  useEffect(() => {
    const q = query(
      collection(db, 'questions', id, 'answers'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setAnswers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  /* 🔹 Submit answer */
  const handleAnswerSubmit = async () => {
    if (!currentUser) return alert('Login required to answer.');
    if (!answerText.trim()) return;

    await addDoc(collection(db, 'questions', id, 'answers'), {
      text: answerText,
      createdAt: new Date(),
      userId: currentUser.uid,
      username: currentUser.email,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false,
    });
    await updateDoc(doc(db, 'questions', id), { answerCount: increment(1) });
    setAnswerText('');
  };

  /* 🔹 Accept & Votes */
  const handleAccept = async (ansId) => {
    await updateDoc(doc(db, 'questions', id, 'answers', ansId), {
      isAccepted: true,
    });
    await updateDoc(doc(db, 'questions', id), { isSolved: true });
  };
  const handleVote = async (ansId, type) => {
    await updateDoc(doc(db, 'questions', id, 'answers', ansId), {
      [type]: increment(1),
    });
  };

  return (
    <div className="min-h-screen py-4 px-4 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg shadow-xl p-8">
        {question ? (
          <>
            {/* Question Title */}
            <h1 className="text-3xl font-bold text-indigo-700 mb-4">
              {question.title}
            </h1>

            {/* Description */}
            <div
              dangerouslySetInnerHTML={{ __html: question.description }}
              className="prose max-w-none mb-6"
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.length ? (
                question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white border border-gray-300 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">No tags</span>
              )}
            </div>

            <hr className="my-3" />

            {/* Answers */}
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">
              Answers ({answers.length})
            </h2>
            <div className="space-y-6">
              {answers.map((ans) => (
                <div
                  key={ans.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: ans.text }}
                    className="prose max-w-none mb-3"
                  />

                  <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                    <p>— {ans.username}</p>

                    <div className="flex items-center gap-4">
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
                  </div>

                  {ans.isAccepted && (
                    <p className="mt-2 text-green-600 font-semibold text-xs">
                      ✔ Accepted Answer
                    </p>
                  )}

                  {currentUser?.uid === question.userId && !ans.isAccepted && (
                    <button
                      onClick={() => handleAccept(ans.id)}
                      className="mt-2 text-green-500 text-xs hover:underline"
                    >
                      Mark as Accepted
                    </button>
                  )}
                </div>
              ))}
            </div>

            <hr className="my-6" />

            {/* Answer Form */}
            {currentUser ? (
              <>
                <h3 className="text-xl font-semibold mb-3 text-indigo-700">
                  Your Answer
                </h3>

                {/* Quill Wrapper with border & bg */}
                <div className="bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
                  <ReactQuill
                    value={answerText}
                    onChange={setAnswerText}
                    placeholder="Write your detailed answer..."
                    className="bg-white"
                  />
                </div>

                <button
                  onClick={handleAnswerSubmit}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Submit Answer
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-600">Login to post an answer.</p>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">Loading question...</p>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;

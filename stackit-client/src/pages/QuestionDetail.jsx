import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import ReactQuill from 'react-quill';
import { useAuth } from '../context/AuthContext';
import { setDoc } from "firebase/firestore";

const QuestionDetail = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [answer, setAnswer] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchQuestion = async () => {
            const docRef = doc(db, 'questions', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setQuestion({ id: docSnap.id, ...docSnap.data() });
        };
        fetchQuestion();
    }, [id]);

    useEffect(() => {
        const q = query(collection(db, 'questions', id, 'answers'), orderBy('createdAt', 'asc'));
        const unsub = onSnapshot(q, (snap) => {
            setAnswers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsub;
    }, [id]);

const handleSubmitAnswer = async () => {
  const answerRef = await addDoc(collection(db, "questions", id, "answers"), {
    content: answer,
    userId: currentUser.uid,
    username: currentUser.email,
    upvotes: [],
    accepted: false,
    createdAt: Timestamp.now(),
  });

  setAnswer("");

  if (question.userId !== currentUser.uid) {
    const notifRef = doc(collection(db, "users", question.userId, "notifications"));
    await setDoc(notifRef, {
      message: `${currentUser.email} answered your question`,
      type: "answer",
      read: false,
      createdAt: Timestamp.now(),
    });
  }
};


    return question ? (
        <div>
            <h2>{question.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: question.description }} />

            <h3>Answers</h3>
            {answers.map((ans) => (
                <div key={ans.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                    <div dangerouslySetInnerHTML={{ __html: ans.content }} />
                    <p>Upvotes: {ans.upvotes.length}</p>
                    {currentUser && !ans.upvotes.includes(currentUser.uid) && (
                        <button
                            onClick={async () => {
                                const ref = doc(db, 'questions', id, 'answers', ans.id);
                                await updateDoc(ref, {
                                    upvotes: [...ans.upvotes, currentUser.uid],
                                });
                            }}
                        >
                            Upvote
                        </button>
                    )}
                    {currentUser?.uid === question.userId && !ans.accepted && (
                        <button
                            onClick={async () => {
                                const ref = doc(db, 'questions', id, 'answers', ans.id);
                                await updateDoc(ref, {
                                    accepted: true,
                                });
                            }}
                            style={{ marginLeft: '10px', color: 'green' }}
                        >
                            Accept Answer
                        </button>
                    )}
                    {ans.accepted && <span style={{ marginLeft: '10px', color: 'green' }}>✔ Accepted Answer</span>}
                </div>
            ))}


            {currentUser && (
                <>
                    <h4>Submit Your Answer:</h4>
                    <ReactQuill value={answer} onChange={setAnswer} />
                    <button onClick={handleSubmitAnswer}>Submit Answer</button>
                </>
            )}
        </div>
    ) : <div>Loading...</div>;
};

export default QuestionDetail;
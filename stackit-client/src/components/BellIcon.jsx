import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

const BellIcon = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(
      collection(db, "users", currentUser.uid, "notifications"),
      (snap) => {
        setNotifications(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    return unsub;
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notifId) => {
    const ref = doc(db, "users", currentUser.uid, "notifications", notifId);
    await updateDoc(ref, { read: true });
  };

  return (
    <div style={{ position: "relative" }}>
      <span>🔔 {unreadCount}</span>

      <div style={{ position: "absolute", background: "#fff", top: 30, border: "1px solid #ddd", padding: 10 }}>
        {notifications.map((n) => (
          <div key={n.id} style={{ background: n.read ? "#fff" : "#eee", padding: 5, marginBottom: 5 }}>
            {n.message}
            {!n.read && (
              <button onClick={() => markAsRead(n.id)} style={{ marginLeft: 10 }}>
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BellIcon;

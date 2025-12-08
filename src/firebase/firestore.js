import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';

// 스니펫 저장
export const saveSnippet = async (userId, date, snippetData) => {
  try {
    const snippetId = `${userId}_${date}`;
    await setDoc(doc(db, 'snippets', snippetId), {
      userId,
      date,
      ...snippetData,
      timestamp: new Date().toISOString(),
      likes: []
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 특정 날짜의 모든 스니펫 가져오기 (같은 팀만)
export const getSnippetsByDate = async (date, managerId = null) => {
  try {
    let q;
    if (managerId) {
      // 같은 관리자의 팀원 스니펫만 가져오기
      q = query(
        collection(db, 'snippets'),
        where('date', '==', date),
        where('managerId', '==', managerId)
      );
    } else {
      // 모든 스니펫 가져오기 (관리자용)
      q = query(
        collection(db, 'snippets'),
        where('date', '==', date)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const snippets = [];
    querySnapshot.forEach((doc) => {
      snippets.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('getSnippetsByDate 결과:', snippets);
    return { success: true, data: snippets };
  } catch (error) {
    console.error('getSnippetsByDate 오류:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// 관리자의 팀원 스니펫 가져오기
export const getTeamMemberSnippets = async (managerId, date) => {
  try {
    console.log('getTeamMemberSnippets 호출:', { managerId, date });
    
    const q = query(
      collection(db, 'snippets'),
      where('managerId', '==', managerId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    const snippets = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('스니펫 문서:', { id: doc.id, managerId: data.managerId, date: data.date });
      snippets.push({ id: doc.id, ...data });
    });
    
    console.log('getTeamMemberSnippets 결과:', snippets);
    return { success: true, data: snippets };
  } catch (error) {
    console.error('getTeamMemberSnippets 오류:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// 좋아요 토글
export const toggleSnippetLike = async (userId, date, currentUserId, hasLiked) => {
  try {
    const snippetId = `${userId}_${date}`;
    const snippetRef = doc(db, 'snippets', snippetId);
    
    await setDoc(snippetRef, {
      likes: hasLiked ? arrayRemove(currentUserId) : arrayUnion(currentUserId)
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자의 스니펫 가져오기
export const getUserSnippets = async (userId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'snippets'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const snippets = [];
    querySnapshot.forEach((doc) => {
      snippets.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: snippets };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 팀장 피드백 저장
export const saveManagerFeedback = async (userId, date, feedback) => {
  try {
    const snippetId = `${userId}_${date}`;
    await setDoc(doc(db, 'snippets', snippetId), {
      managerFeedback: feedback,
      feedbackUpdatedAt: new Date().toISOString()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('피드백 저장 오류:', error);
    return { success: false, error: error.message };
  }
};

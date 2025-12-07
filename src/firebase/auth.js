import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config';

// 사용자 조직 구조
// ID 1-5: 관리자 (isManager: true)
// ID 6-14: 1번 관리자 팀 (개발팀)
// ID 15-23: 2번 관리자 팀 (기획팀)
// ID 24-32: 3번 관리자 팀 (디자인팀)
// ID 33-41: 4번 관리자 팀 (마케팅팀)
// ID 42-50: 5번 관리자 팀 (데이터팀)

const TEAM_NAMES = {
  1: '개발팀',
  2: '기획팀',
  3: '디자인팀',
  4: '마케팅팀',
  5: '데이터팀'
};

// 사용자 ID로 관리자 여부 및 팀 정보 계산
export const getUserInfo = (userId) => {
  const id = parseInt(userId);
  
  if (id >= 1 && id <= 5) {
    return {
      id,
      isManager: true,
      managerId: null,
      teamName: TEAM_NAMES[id],
      role: `${TEAM_NAMES[id]} 관리자`
    };
  }
  
  if (id >= 6 && id <= 50) {
    const managerId = Math.floor((id - 6) / 9) + 1;
    return {
      id,
      isManager: false,
      managerId,
      teamName: TEAM_NAMES[managerId],
      role: `${TEAM_NAMES[managerId]} 팀원`
    };
  }
  
  return null;
};

// 로그인
export const loginUser = async (userId, password) => {
  try {
    const id = parseInt(userId);
    if (id < 1 || id > 50) {
      return { success: false, error: '유효하지 않은 사용자 ID입니다. (1-50)' };
    }

    const email = `user${id}@dailysnippet.com`;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Firestore에서 사용자 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        return { 
          success: true, 
          user: userCredential.user,
          userData: userDoc.data()
        };
      } else {
        // 사용자 문서가 없으면 생성
        const userInfo = getUserInfo(id);
        const userData = {
          id,
          email,
          name: `사용자${id}`,
          ...userInfo,
          createdAt: new Date().toISOString(),
          isInitialSetupComplete: false,
          passwordChanged: false
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        
        return { 
          success: true, 
          user: userCredential.user,
          userData
        };
      }
    } catch (authError) {
      // 계정이 없으면 초기 비밀번호 확인 후 자동 생성
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
        // 초기 비밀번호가 123456이 아니면 거부
        if (password !== '123456') {
          return { success: false, error: '최초 가입 시 비밀번호는 123456 이어야 합니다.' };
        }
        
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const userInfo = getUserInfo(id);
          const userData = {
            id,
            email,
            name: `사용자${id}`,
            ...userInfo,
            createdAt: new Date().toISOString(),
            isInitialSetupComplete: false,
            passwordChanged: false
          };
          
          await setDoc(doc(db, 'users', userCredential.user.uid), userData);
          
          return { 
            success: true, 
            user: userCredential.user,
            userData
          };
        } catch (createError) {
          return { success: false, error: '계정 생성 실패: ' + createError.message };
        }
      }
      
      return { success: false, error: '로그인 실패: ' + authError.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 로그아웃
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 인증 상태 감지
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 사용자 데이터 가져오기
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: '사용자를 찾을 수 없습니다.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 데이터 실시간 구독
export const subscribeToUserData = (uid, callback) => {
  console.log('사용자 데이터 구독 시작:', uid);
  return onSnapshot(doc(db, 'users', uid), (doc) => {
    console.log('Firestore 스냅샷 업데이트:', doc.exists(), doc.data());
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  });
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (uid, data) => {
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 초기 설정 완료
export const completeInitialSetup = async (uid, name, department) => {
  try {
    console.log('Firestore에 저장 시작:', { uid, name, department, db: !!db });
    
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다.');
    }
    
    const userDoc = doc(db, 'users', uid);
    await setDoc(userDoc, {
      name,
      department,
      isInitialSetupComplete: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('Firestore 저장 완료');
    return { success: true };
  } catch (error) {
    console.error('Firestore 저장 오류:', error);
    return { success: false, error: error.message };
  }
};

import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config';

// 사용자 조직 구조
// 마스터 계정: m1(김종윤), m2(조상제), m3(김병국) - 전체 관리자
// ID 1: 피플파트너팀 팀장
// ID 2-11: 피플파트너팀 팀원 (10명)
// ID 12: HRBP팀 팀장
// ID 13-17, 26-27: HRBP팀 팀원 (7명)
// ID 18: 안전보건팀 팀장
// ID 19-25: 안전보건팀 팀원 (7명)

const TEAM_NAMES = {
  1: '피플파트너팀',
  12: 'HRBP팀',
  18: '안전보건팀'
};

const MASTER_ACCOUNTS = {
  'm1': { name: '김종윤', role: '마스터 관리자' },
  'm2': { name: '조상제', role: '마스터 관리자' },
  'm3': { name: '김병국', role: '마스터 관리자' }
};

// 사용자 ID로 관리자 여부 및 팀 정보 계산
export const getUserInfo = (userId) => {
  // 마스터 계정 처리 (m1, m2, m3)
  if (typeof userId === 'string' && MASTER_ACCOUNTS[userId]) {
    return {
      id: userId,
      isManager: true,
      isSuperAdmin: true,
      managerId: null,
      teamName: '전체 관리',
      role: MASTER_ACCOUNTS[userId].role,
      name: MASTER_ACCOUNTS[userId].name,
      isMasterAccount: true
    };
  }
  
  const id = parseInt(userId);
  
  // 피플파트너팀 팀장 (ID 1)
  if (id === 1) {
    return {
      id,
      isManager: true,
      managerId: null,
      teamName: TEAM_NAMES[1],
      role: `${TEAM_NAMES[1]} 팀장`
    };
  }
  
  // 피플파트너팀 팀원 (ID 2-11)
  if (id >= 2 && id <= 11) {
    return {
      id,
      isManager: false,
      managerId: 1,
      teamName: TEAM_NAMES[1],
      role: `${TEAM_NAMES[1]} 팀원`
    };
  }
  
  // HRBP팀 팀장 (ID 12)
  if (id === 12) {
    return {
      id,
      isManager: true,
      managerId: null,
      teamName: TEAM_NAMES[12],
      role: `${TEAM_NAMES[12]} 팀장`
    };
  }
  
  // HRBP팀 팀원 (ID 13-17, 26-27)
  if ((id >= 13 && id <= 17) || (id >= 26 && id <= 27)) {
    return {
      id,
      isManager: false,
      managerId: 12,
      teamName: TEAM_NAMES[12],
      role: `${TEAM_NAMES[12]} 팀원`
    };
  }
  
  // 안전보건팀 팀장 (ID 18)
  if (id === 18) {
    return {
      id,
      isManager: true,
      managerId: null,
      teamName: TEAM_NAMES[18],
      role: `${TEAM_NAMES[18]} 팀장`
    };
  }
  
  // 안전보건팀 팀원 (ID 19-25)
  if (id >= 19 && id <= 25) {
    return {
      id,
      isManager: false,
      managerId: 18,
      teamName: TEAM_NAMES[18],
      role: `${TEAM_NAMES[18]} 팀원`
    };
  }
  
  return null;
};

// 로그인
export const loginUser = async (userId, password) => {
  try {
    // 마스터 계정 처리 (m1, m2, m3)
    let email;
    let isMasterAccount = false;
    
    if (MASTER_ACCOUNTS[userId]) {
      email = `${userId}@dailysnippet.com`;
      isMasterAccount = true;
    } else {
      const id = parseInt(userId);
      if (id < 1 || id > 27) {
        return { success: false, error: '유효하지 않은 사용자 ID입니다. (1-27 또는 마스터 계정)' };
      }
      email = `user${id}@dailysnippet.com`;
    }
    
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
        const userInfo = getUserInfo(isMasterAccount ? userId : parseInt(userId));
        
        const userData = {
          id: isMasterAccount ? userId : parseInt(userId),
          email,
          name: isMasterAccount ? userInfo.name : `사용자${parseInt(userId)}`,
          ...userInfo,
          createdAt: new Date().toISOString(),
          isInitialSetupComplete: isMasterAccount ? true : false,
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
          const userInfo = getUserInfo(isMasterAccount ? userId : parseInt(userId));
          
          const userData = {
            id: isMasterAccount ? userId : parseInt(userId),
            email,
            name: isMasterAccount ? userInfo.name : `사용자${parseInt(userId)}`,
            ...userInfo,
            createdAt: new Date().toISOString(),
            isInitialSetupComplete: isMasterAccount ? true : false,
            passwordChanged: false
          };
          
          await setDoc(doc(db, 'users', userCredential.user.uid), userData);
          
          return { 
            success: true, 
            user: userCredential.user,
            userData
          };
        } catch (createError) {
          // 계정이 이미 존재하는 경우 로그인 시도
          if (createError.code === 'auth/email-already-in-use') {
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
                const userInfo = getUserInfo(isMasterAccount ? userId : parseInt(userId));
                
                const userData = {
                  id: isMasterAccount ? userId : parseInt(userId),
                  email,
                  name: isMasterAccount ? userInfo.name : `사용자${parseInt(userId)}`,
                  ...userInfo,
                  createdAt: new Date().toISOString(),
                  isInitialSetupComplete: isMasterAccount ? true : false,
                  passwordChanged: false
                };
                
                await setDoc(doc(db, 'users', userCredential.user.uid), userData);
                
                return { 
                  success: true, 
                  user: userCredential.user,
                  userData
                };
              }
            } catch (loginError) {
              return { success: false, error: '로그인 실패: ' + loginError.message };
            }
          }
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

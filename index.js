/**
 * MATHCRAFT - 멀티 게임 플랫폼 메인 로비 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  const game1Btn = document.getElementById('btn-play-game-1');
  
  if (game1Btn) {
    const playClick = () => {
      // 묶음 수학 모험(게임 1) 폴더 내부로 연결 진입
      window.location.href = './game_1/index.html';
    };
    
    game1Btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      playClick();
    });
    
    game1Btn.addEventListener('click', playClick);
  }

  const game2Btn = document.getElementById('btn-play-game-2');
  if (game2Btn) {
    const playClick = () => {
      // 구십구 마스터(게임 2) 폴더 내부로 연결 진입
      window.location.href = './game_2/index.html';
    };
    
    game2Btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      playClick();
    });
    
    game2Btn.addEventListener('click', playClick);
  }

  // 모바일/아이패드 뷰포트 스크롤 고정
  document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) { 
      e.preventDefault(); 
    }
  }, { passive: false });
});

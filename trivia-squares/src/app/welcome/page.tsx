'use client';
import WelcomeScreen from '../../components/WelcomeScreen';

/** Shareable guided entry for family tests; does not overwrite any saved board. */
export default function WelcomePage(){
  return <WelcomeScreen onStart={()=>{
    try{localStorage.setItem('trivia-welcome-dismissed-v1','1')}catch{}
    window.location.assign('/');
  }}/>;
}

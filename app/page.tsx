"use client";

import { useState, useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import Navbar from "../components/Navbar";
import HomeView from "../views/HomeView";
import SearchView from "../views/SearchView";
import DetailView from "../views/DetailView";
import StreamView from "../views/StreamView";
import { auth, signInWithGoogleNative } from "../lib/firebase";

export default function ZedxPlayApp() {
  const [view, setView] = useState<"home" | "search" | "detail" | "stream">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUrlId, setActiveUrlId] = useState("");
  const [activeChapterId, setActiveChapterId] = useState("");
  
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isNativePlatform = () => typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNative;

  useEffect(() => {
    if (isNativePlatform()) {
      if (view !== "stream") {
        ScreenOrientation.lock({ orientation: 'portrait' }).catch(() => {});
      }
    }
  }, [view]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setIsLoggingIn(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initPushNotifications = async () => {
      if (isNativePlatform()) {
        try {
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }
          
          if (permStatus.receive !== 'granted') {
            return;
          }

          await PushNotifications.register();

          PushNotifications.addListener('registration', (token) => {
            console.log(token.value);
          });

          PushNotifications.addListener('registrationError', (error: any) => {
            console.log(JSON.stringify(error));
          });

          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            alert(notification.title + '\n\n' + notification.body);
          });

          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log(JSON.stringify(notification));
          });
        } catch (error) {}
      }
    };

    initPushNotifications();
  }, []);

  useEffect(() => {
    if (!isNativePlatform()) return;

    let lastTimeBackPress = 0;
    const timePeriodToExit = 2000;

    const backListener = CapacitorApp.addListener('backButton', () => {
      if (!user) {
         CapacitorApp.exitApp();
         return;
      }

      if (view === "stream") {
        setView("detail");
      } else if (view === "detail" || view === "search") {
        setView("home");
      } else if (view === "home") {
        const currentTime = new Date().getTime();
        if (currentTime - lastTimeBackPress < timePeriodToExit) {
          CapacitorApp.exitApp();
        } else {
          lastTimeBackPress = currentTime;
        }
      }
    });

    return () => {
      backListener.remove();
    };
  }, [view, user]);

  const handleForceLogin = async () => {
    try {
      if (!isNativePlatform()) {
         alert("Login Native cuma jalan di HP cuy.");
         return;
      }
      setIsLoggingIn(true);
      await signInWithGoogleNative();
    } catch (error: any) {
      setIsLoggingIn(false);
      alert("Gagal Login: " + (error.message || JSON.stringify(error)));
    }
  };

  const goHome = () => setView("home");
  
  const goSearch = (query: string) => {
    setSearchQuery(query);
    setView("search");
  };

  const goDetail = (urlId: string) => {
    setActiveUrlId(urlId);
    setView("detail");
  };

  const goStream = (chapterUrlId: string) => {
    setActiveChapterId(chapterUrlId);
    setView("stream");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-[#10b981] selection:text-white">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-wide text-white mb-6">
          Zedx<span className="text-[#10b981]">Play</span>
        </h1>
        <p className="text-[#888888] text-center max-w-sm mb-10 text-sm sm:text-base">
          Silakan login menggunakan akun Google Anda untuk mulai menonton anime kualitas terbaik.
        </p>
        <button 
          onClick={handleForceLogin}
          disabled={isLoggingIn}
          className="bg-[#121212] hover:bg-[#1a1a1a] disabled:opacity-50 border border-[#333333] text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full flex items-center justify-center gap-3 transition-colors shadow-lg min-w-[260px]"
        >
          {isLoggingIn ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Masuk dengan Google
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#e0e0e0] font-sans selection:bg-[#10b981] selection:text-white no-scrollbar">
      {view !== 'detail' && view !== 'stream' && (
         <Navbar onGoHome={goHome} onSearch={goSearch} showSearch={view === "home" || view === "search"} />
      )}
      
      <main className={view === "detail" ? "no-scrollbar" : "max-w-7xl mx-auto no-scrollbar"}>
        {view === "home" && <HomeView onOpenDetail={goDetail} />}
        {view === "search" && <SearchView query={searchQuery} onOpenDetail={goDetail} />}
        {view === "detail" && <DetailView urlId={activeUrlId} onOpenStream={goStream} onBack={goHome} />}
        {view === "stream" && <StreamView chapterUrlId={activeChapterId} onBack={() => setView("detail")} />}
      </main>
    </div>
  );
}

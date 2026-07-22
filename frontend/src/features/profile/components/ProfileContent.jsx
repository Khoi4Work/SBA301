import PersonalInfo from "@/features/profile/components/PersonalInfo.jsx";
import BackgroundTexture from "@/features/profile/components/BackgroundTexture.jsx";
import ProfileHeader from "@/features/profile/components/ProfileHeader.jsx";

export default function ProfileContent({ user, setUser }) {
    return (
        <>
            <BackgroundTexture />

            <div className="max-w-container-max mx-auto px-margin-desktop socratic-void w-full">
                <ProfileHeader
                    user={user}
                    setUser={setUser}
                />

                <div className="grid grid-cols-12 gap-gutter">
                    <PersonalInfo
                        user={user}
                        setUser={setUser}
                    />
                </div>
            </div>
        </>
    );
}
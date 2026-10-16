import InfoPage from "../../components/layout/InfoPage/InfoPage";

export default function Privacy() {
  return (
    <InfoPage
      icon="privacy_tip"
      title="Privacy Policy"
      intro="What we collect, why, and how we look after it."
      updated="2026"
      sections={[
        {
          heading: "What we collect",
          body: (
            <ul>
              <li>Account details: your name, email address and a hashed password.</li>
              <li>Guest details: the display name you choose for a session.</li>
              <li>Quiz activity: rooms you host or join, answers and scores.</li>
            </ul>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <p>
              We use this data to run live quizzes, show leaderboards, sign you
              in and send password reset emails. We do not sell your data.
            </p>
          ),
        },
        {
          heading: "Passwords and reset links",
          body: (
            <p>
              Passwords are stored hashed. Password reset links are single-use
              and expire after 10 minutes.
            </p>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              You can ask us to delete your account and its data at any time by
              contacting support.
            </p>
          ),
        },
      ]}
    />
  );
}

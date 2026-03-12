import fluentComponents from "@fluentui/react-components";

const { Avatar, Button, Card, CardHeader, Text } = fluentComponents;

type LoginOption = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  tagline: string;
  totalPoints: number;
  rank: number | null;
  favoriteGame: string;
};

export function LoginScreen({ users }: { users: LoginOption[] }) {
  return (
    <main className="login-shell">
      <section className="login-hero">
        <p className="eyebrow">Microsoft Entra ID</p>
        <h1>Choose a development identity</h1>
        <p className="hero-copy">
          This local slice uses seeded tenant members so the authenticated flow can be built before Azure app registration values are wired.
        </p>
      </section>
      <section className="login-grid" aria-label="Available users">
        {users.map((user) => (
          <Card key={user.id} className="login-card">
            <CardHeader
              image={<Avatar name={user.displayName} image={{ src: user.avatarUrl ?? undefined }} color="colorful" />}
              header={<Text weight="semibold">{user.displayName}</Text>}
              description={<Text>{user.tagline}</Text>}
            />
            <dl className="stat-grid compact-stat-grid">
              <div>
                <dt>Season rank</dt>
                <dd>{user.rank ? `#${user.rank}` : "Unranked"}</dd>
              </div>
              <div>
                <dt>Season points</dt>
                <dd>{user.totalPoints}</dd>
              </div>
              <div>
                <dt>Favorite game</dt>
                <dd>{user.favoriteGame}</dd>
              </div>
            </dl>
            <form method="post" className="login-form">
              <input type="hidden" name="userId" value={user.id} />
              <Button appearance="primary" type="submit">
                Sign in as {user.displayName}
              </Button>
            </form>
          </Card>
        ))}
      </section>
    </main>
  );
}
import buildClient from '../api/buildClient';

const LandingPage = ({ currentUser }) => {
  return (
    <h1>
      {currentUser ? 'Hello, ' + currentUser.email : 'You are not signed in'}
    </h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');

  return data;
};

export default LandingPage;

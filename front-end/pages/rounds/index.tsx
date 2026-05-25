import { GetServerSideProps } from 'next';

export default function RoundsPageRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};

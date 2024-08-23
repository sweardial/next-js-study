interface Props {
  params: {
    id: string;
  };
}
const Page: React.FC<Props> = async ({ params }) => {
  console.log({ params });


  return (
    <main>
      <div>HAHA hellp</div>
    </main>
  );
};
export default Page;

import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";

const MintNFTForm = ({ currentAccount }) => {
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      image: "",
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput required label="Name" {...form.getInputProps("name")} />
      <Button type="submit">Submit</Button>
    </form>
  );
};

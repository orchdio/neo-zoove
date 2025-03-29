import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Text from "@/components/text/text";
import { toast } from "@/components/toast/toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { MailIcon } from "lucide-react";
import posthog from "posthog-js";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const Waitlist = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const addToWaitlistMutation = useMutation({
    mutationFn: async (data: { email: string; platform: string }) => {
      await axios.post("/api/waitlist", {
        email: data.email,
        platform: data.platform,
      });
      return { email: data.email, platform: data.platform };
    },
    onSuccess: (data: { email: string; platform: string }) => {
      toast({
        title: "You've been added",
        position: "top-right",
        description: (
          <Text
            content={
              "✅ Thanks for joining the waitlist, we'll inform you of future changes"
            }
            className={"text-black"}
          />
        ),
        variant: "success",
      });
      posthog.capture("waitlist.added", {
        email: data.email,
        platform: "zoove",
      });
    },
    onError: (data) => {
      if (data instanceof AxiosError) {
        toast({
          title: "🫰 We already have you",
          position: "top-right",
          description: (
            <Text
              content={
                "You are already on the waitlist, we'll reach out to you."
              }
              className={"text-black"}
            />
          ),
          variant: "warning",
        });
        return;
      }
      toast({
        title: "🙈 Uh-oh! That was embarrassing",
        position: "top-right",
        description: (
          <Text
            content={
              "Something went wrong and we could not add you to the waitlist. Please try again."
            }
            className={"text-black"}
          />
        ),
        variant: "warning",
      });
    },
    mutationKey: ["/waitlist/add"],
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await addToWaitlistMutation.mutateAsync({
      email: data.email,
      platform: "zoove",
    });
  });

  return (
    <div className={"justify-center"}>
      <div>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className={"flex flex-row space-x-2 items-center"}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const errorMessage = form?.formState?.errors?.email?.message;
                return (
                  <FormItem className={"relative flex h-8 flex-auto flex-col"}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                      <MailIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        id="email"
                        placeholder="Join our wait list"
                        className="w-full rounded-md py-1 pl-10 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:ring dark:ring-gray-500"
                      />
                    </FormControl>
                    <FormLabel>
                      {!errorMessage && (
                        <Text
                          content={"We'll never spam you"}
                          className={
                            "text-xs dark:text-zoove-gray-300 text-zoove-gray"
                          }
                        />
                      )}
                      {errorMessage && <Text content={errorMessage} />}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
            <Button
              type="submit"
              variant="secondary"
              className="bg-zoove-blue-400 dark:bg-transparent"
              disabled={addToWaitlistMutation?.isPending}
            >
              <Text
                content="Add me"
                className="dark:text-zoove-blue-100 text-white"
              />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Waitlist;

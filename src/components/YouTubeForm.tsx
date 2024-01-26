import {
  useForm,
  UseFormReturn,
  useFieldArray,
  FieldArrayWithId,
  FormState,
  FieldErrors
} from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import {useEffect} from "react";
import { Subscription } from "react-hook-form/dist/utils/createSubject";

// Define the shape of our form data using TypeScript
type FormValues = {
  username: string,
  email: string,
  channel: string,
  social: {
    twitter: string,
    facebook: string,
  };
  phoneNumbers: string[],
  phNumbers: {
    number: string
  }[],
  age: number,
  dob: Date
};

// Define the type for the API data we get back
export type UserData = {
  id: number,
  name: string,
  username: string,
  email: string,
  address: {
    street: string,
    suite: string,
    city: string,
    zipcode: string,
    geo: {
      lat: string,
      lng: string,
    };
  };
  phone: string,
  website: string,
  company: {
    name: string,
    catchPhrase: string,
    bs: string,
  }
};

// Count number of re-renders
let renderCount: number = 0;

export const YouTubeForm = (): JSX.Element => {
  renderCount++

  // Create a form object using React Hook Form
  const form: UseFormReturn<FormValues> = useForm<FormValues>({
    defaultValues: async (): Promise<FormValues> => {
      const response: Response = await fetch("https://jsonplaceholder.typicode.com/users/1");
      const data: UserData = await response.json();
      return {
        username: "Batman",
        email: data.email,
        channel: "",
        social: {
          twitter: "",
          facebook: ""
        },
        phoneNumbers: ["", ""],
        phNumbers: [
          { number: "" }
        ],
        age: 0,
        dob: new Date()
      };
    }
  });

  // Destructure useful functions and objects from the form object
  const {
    register, // Function to connect form fields with the form state
    handleSubmit, // Function to handle form submission
    formState, // FormState Object,
    control, // Destructure the control object to link the form object to DevTools
    watch,
    getValues, // Will not trigger re-renders or subscribe to input changes when the user clicks ona  button or performs a specific action,
    setValue,
    reset
  }: UseFormReturn<FormValues> = form;
  const {
    errors,
    isDirty,
    isValid,
    isSubmitting,
    isSubmitted,
    isSubmitSuccessful,
    submitCount
  }: FormState<FormValues> = formState

  console.log({ isSubmitted, isSubmitSuccessful, submitCount });

  const {
    fields,
    append,
    remove
  } = useFieldArray({
    name: "phNumbers",
    control
  })

  // Function to execute when the form is submitted
  const onSubmit = (data: FormValues): void => {
    console.log("Form submitted:", data);
  };

  const handleGetValues = (): void => {
    console.log("Get values: ", getValues("social"));
  }

  const onError = (errors: FieldErrors<FormValues>): void => {
    console.log("Errors: ", errors);
  }

  const handleSetValue = (): void => {
    setValue("username", "", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  // Watch for watchedUsername to change without triggering a re-render
  useEffect(() => {
    // Subscribe to changes using watch and log the updated value to the console
    const subscription: Subscription = watch((value): void => {
      console.log("Username changed:", value.username);
    });

    // Clean up the subscription when the component is unmounted
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect((): void => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful])

  return (
    <div>
      <h2>Render Count: { renderCount / 2 }</h2>
      <form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="form-control">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            {...register("username", {
              disabled: true,
              required: {
                value: true,
                message: "Username is required",
              }
            })}
          />
          {/* Display the validation message for the userName input field if present */}
          <p className="error">{errors.username?.message}</p>
        </div>
        <div className="form-control">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            {...register("email", {
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email format"
              },
              validate: {
                notAdmin: (fieldValue: string) =>
                  fieldValue !== " " || "Enter a different email address",
                notBlackListed: (fieldValue: string) =>
                  !fieldValue.endsWith("baddomain.com") || "This domain is not supported",
                emailAvailable: async (fieldValue: string) => {
                  const response: Response = await fetch(`https://jsonplaceholder.typicode.com/users?email=${fieldValue}`);
                  const data = await response.json();
                  return data.length == 0 || "Email already exists"
                }
              }
            })}
          />
          {/* Display the validation message for the email input field if present */}
          <p className="error">{errors.email?.message}</p>
        </div>
        <div className="form-control">
          <label htmlFor="channel">Channel</label>
          <input
            type="text"
            id="channel"
            {...register("channel", {
              required: "Channel is required"
            })}
          />
          {/* Display the validation message for the channel input field if present */}
          <p className="error">{errors.channel?.message}</p>
        </div>
        <div className="form-control">
          <label htmlFor="twitter">Twitter</label>
          <input type="text" id="channel" {...register("social.twitter")} />
        </div>
        <div className="form-control">
          <label htmlFor="facebook">Facebook</label>
          <input type="text" id="channel" {...register("social.facebook")} />
        </div>
        <div className="form-control">
          <label htmlFor="primary-phone">Primary phone number</label>
          <input type="text" id="channel" {...register("phoneNumbers.0")} />
        </div>
        <div className="form-control">
          <label htmlFor="secondary-phone">Secondary phone number</label>
          <input type="text" id="channel" {...register("phoneNumbers.1")} />
        </div>

        <div>
          <label>List of phone numbers</label>
          <div>
            {fields.map((
              field: FieldArrayWithId<FormValues, "phNumbers", "id">,
              index: number
            ) => {
              return (
                <div className="form-control" key={field.id}>
                  <input type="text" {...register(`phNumbers.${index}.number` as const)}/>
                  {
                    index > 0 && (
                      <button type="button" onClick={() => remove(index)}>Remove</button>
                    )
                  }
                </div>
              )
            })}
            <button type="button" onClick={() => append({ number: "" })}>Add phone number</button>
          </div>
        </div>

        <div className="form-control">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            {...register("age", {
              valueAsNumber: true,
              required: "Age is required"
            })}
          />
          {/* Display the validation message for the channel input field if present */}
          <p className="error">{errors.age?.message}</p>
        </div>

        <div className="form-control">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            id="dob"
            {...register("dob", {
              valueAsDate: true,
              required: "Dob is required"
            })}
          />
          {/* Display the validation message for the channel input field if present */}
          <p className="error">{errors.dob?.message}</p>
        </div>

        <button disabled={!isDirty || !isValid || isSubmitting}>Submit</button>
        <button type="button" onClick={handleGetValues}>Get Values</button>
        <button type="button" onClick={handleSetValue}>Set value</button>
        <button type="button" onClick={() => reset()}>Reset</button>
      </form>
      <DevTool control={control} />
    </div>
  );
};

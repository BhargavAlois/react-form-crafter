# react-form-crafter: A React-Based Form Generator

It is a React package designed to dynamically generate forms based on a provided JSON schema. It streamlines the process of building interactive, data-driven forms with support for custom fields, widgets, templates, and validation.

## Installation

Install react-form-crafter with npm

```bash
  npm install react-form-crafter
```

## Usage/Examples

```javascript
function App() {
  const [formData, setFormData] = useState();

  const templates = {
    myCustomRowTemplate: CustomTemplate,
  };

  const fields = {
    CustomPassword: PasswordWidget,
    CustomGenPassword: PasswordGenWidget,
    DatePickerWidget: DatePickerWidget,
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    console.log("data : ", data);
  };

  const handleOnError = () => {
    console.log("Error occured");
  };

  const handleOnSuccess = () => {
    window.alert("Form Submitted");
  };

  const handleOnChange = (data) => {
    console.log("data : ", data);
  };

  return (
    <MyForm
      schema={schema}
      uiSchema={uiSchema}
      templates={templates}
      widgets={widgets}
      fields={fields}
      onSubmit={handleFormSubmit}
      onChange={handleOnChange}
      onSuccess={handleOnSuccess}
      onError={handleOnError}
      formData={formData}
    />
  );
}

export default App;
```

## Schema

The `schema` defines the structure of the form fields.

The `uiSchema` customizes the appearance and behavior of the form elements

```javascript
{
        name: 'login',
        title: 'Sign In',
        **schema**: {  // 🟢 Schema Definition
          type: 'object',
          properties: {
            email: {
              type: 'string',
              title: 'Email',
            },
            password: {
              type: 'string',
              title: 'Password',
              minLength: 3,
              maxLength: 15,
            },
          },
          required: ['email', 'password'],
        },
        uiSchema: {   // 🟢 uiSchema Definition
          'ui:submitButtonOptions': {
            submitText: 'Login',
            hide: false, //Default to false
            props: {
              disabled: false,
              className: 'LoginBtn primaryButton d-flex justify-content-center align-items-center',
            },
          },
          email: {
            'ui:widget': 'email',
            'ui:placeholder': 'Enter your email',
            className: 'w-100 fw-bold primary p-0 mb-2 title-m',
            'ui:options': {
              label: true,
            },
          },
          password: {
            'ui:widget': 'CustomPassword',
            'ui:placeholder': 'Enter your password',
            className: 'w-100 fw-bold primary p-0 mb-1 title-m',
            'ui:options': {
              label: true,
            },
          },
        },
      },
```

| **Key**   | **Type**  | **Location**             | **Description**                                                               |
| --------- | --------- | ------------------------ | ----------------------------------------------------------------------------- |
| **hide**  | `boolean` | `ui:submitButtonOptions` | Determines whether the submit button is hidden (`true`) or shown (`false`).   |
| **label** | `boolean` | `ui:options`             | Determines whether the field label is displayed (`true`) or hidden (`false`). |

Equivalent HTML code:

```HTML

    <div class="form-group w-100 fw-bold primary p-0 mb-2 title-m">
      <label class="form-label">Email<span>*</span></label>
      <input type="text" name="email" class="form-control" placeholder="Enter your email" value="kartik.gupta@aloissolutions.com">
    </div>
    <div class="form-group w-100 fw-bold primary p-0 mb-1 title-m m-0">
      <label class="form-label">Password<span>*</span></label>
      <div class="input-group">
        <input type="password" class="form-control" placeholder="Enter your password" value="password1">
        <button type="button" class="btn" style="border-top: 1px solid rgb(206, 212, 218); border-right: 1px solid rgb(206, 212, 218); border-bottom: 1px solid rgb(206, 212, 218); border-left: none; border-image: initial; background-color: white;">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </button>
      </div>
    </div>

```

- Classes mentioned in className of individual field are applied to div which is wrapping label and input of that field.
- Classes mentioned in className inside ui:options are applied on the input tag.

eg. for above two statements

```javascript
email: {
    'ui:widget': 'email',
    'ui:placeholder': 'Enter your email',
    'className': 'w-100 fw-bold primary p-0 mb-2 title-m'
  },
```

```HTML
<div class="form-group w-100 fw-bold primary p-0 mb-2 title-m">
      <label class="form-label">Email<span>*</span></label>
      <input type="text" name="email" class="form-control" placeholder="Enter your email" value="kartik.gupta@aloissolutions.com">
</div>
```

```javascript
email: {
    'ui:widget': 'email',
    'ui:placeholder': 'Enter your email',
    'className': 'w-100 fw-bold primary p-0 mb-2 title-m'
    'ui:options': {
      'className': 'bg-light'
    }
  },
```

```HTML
<div class="form-group w-100 fw-bold primary p-0 mb-2 title-m">
      <label class="form-label">Email<span>*</span></label>
      <input type="text" name="email" class="form-control bg-light" placeholder="Enter your email" value="kartik.gupta@aloissolutions.com">
</div>
```

```javascript
uiSchema: {
    hideTitle: true,
    layout: [
      {
        type: 'section',
        title: 'Employee Information',
        className: 'row',
        fields: [
          {
            type: 'section',
            className: 'col-4',
            fields: ['info.profilePic',]
          },
          {
            type: 'section',
            className: 'col-4',
            fields: ['info.firstName', 'info.lastName'],
          },
          {
            type: 'section',
            className: 'col-4',
            fields: ['info.empId', 'info.designation'],
          },
        ],
      },
      {
        type: 'section',
        title: 'Personal Information',
        className: 'row',
        fields: [
          {
            type: 'section',
            className: 'col-4',
            fields: ['personalInfo.gender', 'personalInfo.nationality', 'personalInfo.residence'],
          },
          {
            type: 'section',
            className: 'col-4',
            fields: ['personalInfo.dateOfBirth', 'personalInfo.phoneNumber'],
          },
          {
            type: 'section',
            className: 'col-4',
            fields: ['personalInfo.bloodGroup', 'personalInfo.address']
          }
        ],
      },
    ],

    "ui:submitButtonOptions": {
      submitText: "Submit",
      props: {
        disabled: false,
        className: "primaryButton",
      },
    },
    info: {
      className: "employe-info",
      profilePic: {
        "ui:widget": "ProfileImage",
        "ui:options": {
          accept: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/webp",
            "image/svg+xml",
            "image/tiff",
            "image/x-icon",
          ],
          className: "profile-pic",
        },
      },
      firstName: {
        className: "first-name",
        "ui:placeholder": "Enter First Name",
      },
      lastName: {
        className: "last-name",
        "ui:placeholder": "Enter Last Name",
      },
      empId: {
        className: "emp-id",
        "ui:placeholder": "Enter Employee ID",
      },
      designation: {
        className: "designation",
        "ui:placeholder": "Enter Designation",
      },
      preview: true,
    },
    personalInfo: {
      className: "personal-info employe-info",
      gender: {
        className: "gender",
        "ui:placeholder": "Select Gender",
        "ui:widget": "select",
      },
      dateOfBirth: {
        className: "date-of-birth",
        "ui:widget": "DatePickerWidget",
      },
      bloodGroup: {
        className: "blood-group",
        "ui:placeholder": "Select Blood Group",
        "ui:widget": "select",
      },
      nationality: {
        className: "nationality",
        "ui:placeholder": "Enter Nationality",
      },
      phoneNumber: {
        "ui:widget": "CustomPhoneNumber",
        className: "phone-number",
        pattern_message: ["Invalid phone number"],
      },
      address: {
        className: "address",
        "ui:placeholder": "Enter Address",
      },
      residence: {
        className: "residence",
        "ui:placeholder": "Select Residence",
        "ui:widget": "select",
      },
    }
  }
```

Layout key divides fields into several divisions. className key can be used to apply classes to individual section. (Below html code demonstrates row and col-4 classes applied to sections by use of schema).
titleClass key can be used to give classes to title.

```HTML
<div class="w-100 row justify-content-around">
  <div class="w-100 mb-2">
    <h5 class="mb-2">Employee Information</h5>
    <div class="row">
      <div class="col-4">
        <div class="form-group profile-pic m-0">
          <label class="form-label">Profile Image Upload</label>
          <div class="fileupload-preview d-flex align-items-center">
            <img
              src="https://t3.ftcdn.net/jpg/05/53/79/60/360_F_553796090_XHrE6R9jwmBJUMo9HKl41hyHJ5gqt9oz.jpg"
              alt="Profile preview"
              class="single-user-profile"
              style="width: 130px; height: 130px; margin-right: 10px; cursor: pointer;">
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn btn-primary primaryButton" type="button">Change Picture</button>
            </div>
            <input type="file" capture="user" accept="image/*" style="display: none;">
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="form-group first-name">
          <label class="form-label">First Name</label>
          <input type="text" class="form-control" name="firstName" placeholder="Enter First Name" value="">
        </div>
        <div class="form-group last-name">
          <label class="form-label">Last Name</label>
          <input type="text" class="form-control" name="lastName" placeholder="Enter Last Name" value="patel">
        </div>
      </div>
      <div class="col-4">
        <div class="form-group emp-id">
          <label class="form-label">Employee ID</label>
          <input type="text" class="form-control" name="empId" placeholder="Enter Employee ID" value="">
        </div>
        <div class="form-group designation">
          <label class="form-label">Designation</label>
          <input type="text" class="form-control" name="designation" placeholder="Enter Designation" value="">
        </div>
      </div>
    </div>
  </div>

  <div class="w-100 mb-2">
    <h5 class="mb-2">Personal Information</h5>
    <div class="row">
      <div class="col-4">
        <div class="form-group gender">
          <label class="form-label">Gender</label>
          <select name="gender" class="form-select" placeholder="Select Gender">
            <option value="">Select an option</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group nationality">
          <label class="form-label">Nationality</label>
          <input type="text" class="form-control" name="nationality" placeholder="Enter Nationality" value="">
        </div>
        <div class="form-group residence">
          <label class="form-label">Residence</label>
          <select name="residence" class="form-select" placeholder="Select Residence">
            <option value="">Select an option</option>
            <option value="Non-US">Non-US</option>
            <option value="US">US</option>
          </select>
        </div>
      </div>
      <div class="col-4">
        <div class="form-group date-of-birth m-0">
          <label class="form-label">Date Of Birth</label>
          <div class="form-group">
            <input type="date" class="form-control" value="" max="2004-02-07">
          </div>
        </div>
        <div class="form-group phone-number m-0">
          <label class="form-label">Phone Number</label>
          <div class="mb-3">
            <div class="input-group">
              <select class="form-select" name="countryCode" style="max-width: 4.4rem;">
                <option value="+91">🇮🇳 (+91)</option>
                <option value="+1">🇺🇸 (+1)</option>
                <option value="+506">🇨🇷 (+506)</option>
                <option value="+44">🇬🇧 (+44)</option>
                <option value="+31">🇳🇱 (+31)</option>
                <option value="+48">🇵🇱 (+48)</option>
                <option value="+971">🇦🇪 (+971)</option>
                <option value="+61">🇦🇺 (+61)</option>
              </select>
              <input type="tel" class="form-control" placeholder="Enter phone number" name="phoneNumber" pattern="^[0-9]{6,14}$" title="Enter a valid phone number" value="">
            </div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="form-group blood-group">
          <label class="form-label">Blood Group</label>
          <select name="bloodGroup" class="form-select" placeholder="Select Blood Group">
            <option value="">Select an option</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div class="form-group address">
          <label class="form-label">Address</label>
          <input type="text" class="form-control" name="address" placeholder="Enter Address" value="">
        </div>
      </div>
    </div>
  </div>
</div>
```

If layout is not provided then fields having type object are assigned ids which can be further used in custom css files to apply styling.

```javascript
type: "object",
    properties: {
      info: {
        type: "object",
        title: "Employee Information",
        properties: {
          profilePic: {
            type: "string",
            format: "data-url",
            title: "Profile Image Upload",
          },
          firstName: {
            type: "string",
            title: "First Name",
            default: "DefaultFirstName",
          },
        },
        required: ["firstName", "lastName", "empId", "designation"],
      },
      personalInfo: {
        type: "object",
        title: "Personal information",
        properties: {
          gender: {
            type: "string",
            title: "Gender",
            oneOf: [
              { const: "male", title: "Male" },
              { const: "female", title: "Female" },
              { const: "other", title: "Other" },
            ],
            default: "other",
          },
          dateOfBirth: {
            type: "string",
            format: "date",
            title: "Date Of Birth",
            dateType: "dateOfBirth",
          },
        },
      }
    }
```

Below html code demonstrates that according to schema having two objects info and personalInfo, the id root_info is provided to the div containing fields mentioned in info object.

```HTML
<div>
  <legend id="root_info__title" class="mt-2">
    Employee Information<span>*</span>
  </legend>

  <div id="root_info" class="employee-info">
    <div class="form-group profile-pic m-0">
      <label class="form-label">Profile Image Upload</label>
      <div class="fileupload-preview d-flex align-items-center">
        <img
          src="https://t3.ftcdn.net/jpg/05/53/79/60/360_F_553796090_XHrE6R9jwmBJUMo9HKl41hyHJ5gqt9oz.jpg"
          alt="Profile preview"
          class="single-user-profile"
          style="width: 130px; height: 130px; margin-right: 10px; cursor: pointer;">

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary primaryButton" type="button">Change Picture</button>
        </div>

        <input type="file" capture="user" accept="image/*" style="display: none;">
      </div>
    </div>

    <div class="form-group first-name">
      <label class="form-label">First Name<span>*</span></label>
      <input type="text" class="form-control" name="firstName" placeholder="Enter First Name" value="DefaultFirstName">
    </div>
  </div>
</div>

```

### Widgets

- can be mentioned using ui:widget:"widget_name" in uiSchema.

| **Widget Name** | **Description**                                                                 |
| --------------- | ------------------------------------------------------------------------------- |
| `string`        | Renders a standard text input field for single-line text input.                 |
| `text`          | Alias for `string`, renders a single-line text input.                           |
| `TextWidget`    | Renders a standard text input field for single-line text input.                 |
| `alt-date`      | Renders an alternate date input field with customized formatting.               |
| `password`      | Renders a password input field that masks user input for sensitive data.        |
| `email`         | Renders an input field for email addresses with validation for email format.    |
| `file`          | Renders a file upload input allowing users to select and upload files.          |
| `button`        | Renders a button element, typically used for form submission or actions.        |
| `calendar`      | Renders a calendar picker for selecting dates directly from a calendar view.    |
| `checkboxes`    | Renders a group of checkboxes for multiple selection options.                   |
| `date`          | Renders a standard date input field for selecting dates.                        |
| `daterange`     | Renders inputs to select a start date and an end date for date range selection. |
| `datetime`      | Renders a date and time input field.                                            |
| `day`           | Renders an input field specifically for selecting a day of the month.           |
| `month`         | Renders an input field specifically for selecting a month.                      |
| `progress`      | Renders a progress bar input, useful for visualizing completion percentage.     |
| `radio`         | Renders a group of radio buttons for single-option selection.                   |
| `range`         | Renders a slider input for selecting a range value.                             |
| `select`        | Renders a dropdown (select) menu for single-option or multi-option selection.   |
| `time`          | Renders an input field for selecting time.                                      |
| `updown`        | Renders a numeric input with increment and decrement controls.                  |
| `UpDownWidget`  | Renders a numeric input with increment and decrement controls.                  |
| `year`          | Renders an input field for selecting a year.                                    |
| `numberEnum`    | Renders a group of radio buttons for numeric options.                           |
| `textarea`      | Renders a multi-line text input area for longer text input.                     |

Usage of button widget mentioned above :

```javascript
const schema = {
  type: "object",
  properties: {
    actionButton: {
      title: "Action Button",
    },
    myButton: {
      title: "My Button",
    },
  },
};
const uiSchema = {
  type: "object",
  properties: {
    actionButton: {
      "ui:widget": "button",
      "ui:options": {
        value: "Custom button 1",
        onClick: () => {
          window.alert("Custom button pressed");
        },
      },
      className: "btn btn-success mt-3",
    },
    myButton: {
      "ui:widget": "button",
      "ui:options": {
        value: "Custom button 2",
        onClick: () => {
          window.alert("My button pressed");
        },
      },
      className: "btn border rounded-1 btn-danger mt-3",
    },
  },
};
```

Output :
![Alt text](https://github.com/BhargavAlois/RJSF-FROM-SCRATCH/blob/rjsf-custom-approach-change/Usage%20of%20button%20widget.png)

## Custom Widgets

```javascript
import React from "react";
import { FaRegEyeSlash, FaEye } from "react-icons/fa6";

const PasswordWidget = (props) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    props.onChange(e.target.value);
  };

  return (
    <div className="input-group">
      <input
        type={showPassword ? "text" : "password"}
        className="form-control"
        placeholder={props.placeholder}
        value={props.value || ""}
        onChange={handleChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        required={props.required}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="btn"
        style={{
          border: "1px solid #ced4da",
          borderLeft: "none",
          borderRadius: "0.5",
          backgroundColor: "white",
        }}
      >
        {showPassword ? <FaEye /> : <FaRegEyeSlash />}
      </button>
    </div>
  );
};

export default PasswordWidget;
```

Users just need to define input field. Label and errors are displayed by react-form-crafter.

## Custom Fields

Whole component has to be designed by user including label, input fields and errors.

### Props Provided to Custom Widgets and Custom Fields

When creating custom widgets, the following props are passed to them:

| **Prop Name** | **Description**                                                 |
| ------------- | --------------------------------------------------------------- |
| `schema`      | The JSON Schema definition for the field.                       |
| `uiSchema`    | The UI Schema for customizing field appearance and behavior.    |
| `value`       | The current value of the field in the form.                     |
| `onChange`    | Callback function triggered when the field value changes.       |
| `onReset`     | Function to handle form reset.                                  |
| `onSubmit`    | Function to handle form submission.                             |
| `errors`      | List of validation errors for the field, if any.                |
| `placeholder` | The placeholder text specified in `uiSchema["ui:placeholder"]`. |
| `options`     | Additional options for the field as specified in `uiSchema`.    |

## Custom Templates

- To customize layout of the form

### Props Provided to Custom Templates

| **Prop Name**      | **Description**                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `schema`           | The JSON Schema definition for the form.                                                         |
| `uiSchema`         | The UI Schema for customizing form appearance and behavior.                                      |
| `content`          | The rendered form fields and components. Place this inside the form tag in your custom template. |
| `onSubmit`         | Function to handle form submission.                                                              |
| `onReset`          | Function to handle form reset.                                                                   |
| `submitBtnOptions` | Options for customizing the submit button appearance and behavior.                               |
| `resetBtnOptions`  | Options for customizing the reset button appearance and behavior.                                |

### Example of customizing submit and reset buttont through schema

```javascript
'ui:submitButtonOptions': {
            // hide: 'true', For hiding the submit button
            submitText: 'Send', //Will display text "Send" inside button
            props: {
              disabled: false,
              className: 'LoginBtn primaryButton d-flex justify-content-center align-items-center',
            },
          },
```

```javascript
'ui:resetButtonOptions': {
            // show: true, To display the reset button
            clearText: 'Clear', //Will display text "Clear" inside button
            props: {
              disabled: false,
              className: 'LoginBtn primaryButton d-flex justify-content-center align-items-center',
            },
          }
```

- submitText: Defines the text displayed on the submit button.
- props: Allows customization of button properties, such as disabled state and className for styling.

### Example of Custom Template

```javascript
import React from "react";
import Button from "@mui/material/Button";

export default function CustomTemplate(props) {
  const { schema, content, onSubmit } = props;

  return (
    <div className="d-flex flex-column">
      <!-- Header is customizable -->
      <header className="mb-4 text-center">
        <h3> Custom Title </h3>
        <p> Custom Description </p>
      </header>

      <!-- Customizable form tag -->
      <form
        onSubmit={onSubmit}
        className="d-flex flex-column align-items-center p-5 border border-dark border-opacity-25 rounded-4 shadow"
        style={{ overflow: "auto" }}
      >
        {content} <!-- Use content prop to render input fields -->

        <!-- Customizable submit button -->
        <button
          className="mt-3"
          type="submit"
          style={{
            border: "2px solid rgb(0, 79, 162)",
            borderRadius: "2px",
            padding: "6px",
            fontWeight: "600",
            fontSize: "16px",
            backgroundColor: "rgb(0, 79, 162)",
            color: "#fff",
            transition: "all 0.3s ease",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#0056b3";
            e.target.style.borderColor = "#0056b3";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#007bff";
            e.target.style.borderColor = "#007bff";
          }}
        >
          Submit
        </button>
      </form>

      <!-- Customizable footer -->
      <footer className="mt-4 text-center">Custom footer content</footer>
    </div>
  );
}
```

## Validation

- **Required Fields**: Enforces mandatory completion of specific fields.
- **Min/Max Length**: Sets minimum and maximum character limits for string inputs (e.g., passwords).

  - **How to Use**:
    - To set a minimum length for a string input, use the `minLength` property.
    - To set a maximum length for a string input, use the `maxLength` property.
    ```json
    {
      "type": "string",
      "minLength": 8,
      "maxLength": 20
    }
    ```
    - This ensures the field value falls within the defined character limits.

- **Minimum & Maximum value for field**: Sets minimum and maximum value possible for input field.

  - **How to Use**:
    - To set a minimum length for a string input, use the `minLength` property.
    - To set a maximum length for a string input, use the `maxLength` property.
    ```json
    {
      "type": "string",
      "minLength": 8,
      "maxLength": 20
    }
    ```
    - This ensures the field value falls within the defined character limits.

- **Pattern Matching**: Ensures input conforms to a specific regex pattern (e.g., email and phone number formats).

  - **How to Use**:
    - Use the `pattern` property to provide a regular expression for the input value.
    ```json
    {
      "type": "string",
      "pattern": "^\\S+@\\S+\\.\\S+$"
    }
    ```
    - This pattern checks for an email format.

- **Pattern Messages**: Customizes error messages for pattern mismatches and allows multiple messages to be displayed if needed.

  - **How to Use**:
    - You can define the `patternMessage` property to specify custom error messages that should be displayed when the input doesn't match the defined pattern.
    - If you want to display multiple error messages for different patterns, you can use an array of messages.
    ```json
    {
      "type": "string",
      "pattern": "^\\S+@\\S+\\.\\S+$",
      "patternMessage": [
        "Please enter a valid email address.",
        "Email format should be 'example@domain.com'."
      ]
    }
    ```
    - This allows flexibility in displaying multiple messages to guide the user in correcting their input.

- **Range Validation**: Defines minimum and maximum values for numeric fields (e.g., integer range and progress).

  - **How to Use**:
    - For numeric fields, use `minimum` and `maximum` properties to specify valid numeric ranges.
    ```json
    {
      "type": "number",
      "minimum": 1,
      "maximum": 100
    }
    ```
    - This ensures the numeric value is within the specified range.

- **Format Validation**: Ensures data conforms to specific formats like `email`, `date`, `time`, or `date-time`.

  - **How to Use**:
    - Use the `format` property to specify predefined formats.
    ```json
    {
      "type": "string",
      "format": "email"
    }
    ```
    - This validates that the input is a valid email.

- **File Type Check**: Ensures that the selected file matches one of the accepted MIME types, as specified in the `ui:options.accept` property (e.g., `ui:options.accept: "image/jpeg, image/png"`).
  - **How to Use**:
    - Set the `ui:options.accept` property to specify the valid MIME types.
    ```json
    {
      "type": "string",
      "format": "data-url",
      "ui:options": {
        "accept": ["image/jpeg, image/png"]
      }
    }
    ```
    - This ensures the file matches the specified file types.

### Error Messages

- **Required Fields**: "This <field_name> is required."
- **Min/Max Length**: "Input must be between 8 and 20 characters."
- **Pattern Matching**: "Invalid email format."
- **Range Validation**: "Value must be between 1 and 100."
- **File Type Check**: "The selected file type <fileType> is not supported."

**Start the game in development**

`npm run start`

-   In case of bug, clean the cache

    `expo r -c`

**Run the app on your mobile with Expo**

-   install "expo" client app from app store
-   navigate to https://expo.dev/@yilmazito/tic-toc-toe
-   scan the pr code with your camera. expo will automaitcally download the project

## AWS SETUP

**Set up aws amplify**
`npm i -g @aws-amplify/cli`

$ amplify configure

this command will take you to the AWS console to log you in. Then will ask you to enter some information. this will configure amplify in your machine. Inside root project

$ amplify init

thsi will also ask you some questions. 'Source directory" and "Distribution directory" should be "./". After answering those quesiton, "amplify" directory will be created the root

**Configure services for the app using cli**

$ amplify add api

-   I choose graphql service. Choose "cognito" for default authorization type for api. After answering all the questions, you need to push the settings to aws
    $ amplify status
-   So far we have created authentication service and api service
    $ amplify push

**Install Amplify libraries for react-native**

$ npm install aws-amplify aws-amplify-react-native @react-native-community/netinfo @react-native-async-storage/async-storage

    - aws-amplify will create `aws-exports.js` at root of the project. This file contains data about the amplify project. In order to import the configuration obect this will change its extension to ".ts".
    - Initialize the Amplify client in "src/index.ts"

```js
import Amplify from "aws-amplify";
import config from "../aws-exports";

Amplify.configure(config);
```

'npm run mock` will start the mock servery

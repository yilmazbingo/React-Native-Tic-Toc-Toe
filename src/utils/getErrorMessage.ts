const getErrorMessage = (error: { [key: string]: any }): string => {
    const defaultError = "An error has occured";
    // this is specific for aws amplify
    if (error.errors && error.errors.length > 0) {
        return error.errors[0].message || defaultError;
    }
    if (error.message) {
        return error.message;
    }
    return defaultError;
};

export default getErrorMessage;

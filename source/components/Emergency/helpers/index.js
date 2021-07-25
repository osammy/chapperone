import {getValidator} from '../../../resources/utils';

export const validateInput = formValues => {
  const errs = [];
  const stringValidators = getValidator('string');

  if (!formValues?.name || formValues?.name === '') {
    errs.push({
      key: 'name',
      errMessage: 'Name cannot be empty',
    });
  }
  if (formValues?.name?.length > 30) {
    errs.push({
      key: 'name',
      errMessage: 'Name cannot be more than 30 characters long',
    });
  }

  if (stringValidators.containsAnyNumber(formValues?.name)) {
    errs.push({
      key: 'name',
      errMessage: 'Name cannot contain numbers',
    });
  }

  // if (!formValues.address || formValues.address === '') {
  //   errs.push({
  //     key: 'address',
  //     errMessage: 'Address cannot be empty',
  //   });
  // }

  if (formValues?.title && formValues.title?.length > 40) {
    errs.push({
      key: 'address',
      errMessage: 'Title cannot be more than 40 characters long',
    });
  }
  if (formValues.address?.length > 250) {
    errs.push({
      key: 'address',
      errMessage: 'Address cannot be more than 250 characters long',
    });
  }
  // if (!formValues.phoneNo || formValues.phoneNo === '') {
  //   errs.push({
  //     key: 'phoneNo',
  //     errMessage: 'Phone number cannot be empty',
  //   });
  // }

  return errs;
};

export const validateTextBoxInput = textBoxValues => {
  const errs = [];

  if (!textBoxValues.title || textBoxValues.title === '') {
    errs.push({
      key: 'title',
      errMessage: 'Title cannot be empty',
    });
  }
  if (textBoxValues.title?.length > 40) {
    errs.push({
      key: 'title',
      errMessage: 'Title cannot be more than 40 characters long',
    });
  }

  if (!textBoxValues.content || textBoxValues.content === '') {
    errs.push({
      key: 'content',
      errMessage: 'Content cannot be empty',
    });
  }

  if (textBoxValues.content?.length > 250) {
    errs.push({
      key: 'content',
      errMessage: 'Content cannot be more than 250 characters long',
    });
  }

  return errs;
};

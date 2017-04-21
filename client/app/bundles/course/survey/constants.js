import mirrorCreator from 'mirror-creator';

export const questionTypes = {
  TEXT: 'text',
  MULTIPLE_CHOICE: 'multiple_choice',
  MULTIPLE_RESPONSE: 'multiple_response',
};

export const draggableTypes = mirrorCreator([
  'QUESTION',
]);

export const formNames = mirrorCreator([
  'SURVEY',
  'SURVEY_QUESTION',
  'SURVEY_RESPONSE',
  'SURVEY_SECTION',
]);

const actionTypes = mirrorCreator([
  'CREATE_SURVEY_REQUEST',
  'CREATE_SURVEY_SUCCESS',
  'CREATE_SURVEY_FAILURE',
  'LOAD_SURVEY_REQUEST',
  'LOAD_SURVEY_SUCCESS',
  'LOAD_SURVEY_FAILURE',
  'LOAD_SURVEYS_REQUEST',
  'LOAD_SURVEYS_SUCCESS',
  'LOAD_SURVEYS_FAILURE',
  'UPDATE_SURVEY_REQUEST',
  'UPDATE_SURVEY_SUCCESS',
  'UPDATE_SURVEY_FAILURE',
  'DELETE_SURVEY_REQUEST',
  'DELETE_SURVEY_SUCCESS',
  'DELETE_SURVEY_FAILURE',
  'CREATE_SURVEY_QUESTION_REQUEST',
  'CREATE_SURVEY_QUESTION_SUCCESS',
  'CREATE_SURVEY_QUESTION_FAILURE',
  'UPDATE_SURVEY_QUESTION_REQUEST',
  'UPDATE_SURVEY_QUESTION_SUCCESS',
  'UPDATE_SURVEY_QUESTION_FAILURE',
  'DELETE_SURVEY_QUESTION_REQUEST',
  'DELETE_SURVEY_QUESTION_SUCCESS',
  'DELETE_SURVEY_QUESTION_FAILURE',
  'CREATE_SURVEY_SECTION_REQUEST',
  'CREATE_SURVEY_SECTION_SUCCESS',
  'CREATE_SURVEY_SECTION_FAILURE',
  'UPDATE_SURVEY_SECTION_REQUEST',
  'UPDATE_SURVEY_SECTION_SUCCESS',
  'UPDATE_SURVEY_SECTION_FAILURE',
  'DELETE_SURVEY_SECTION_REQUEST',
  'DELETE_SURVEY_SECTION_SUCCESS',
  'DELETE_SURVEY_SECTION_FAILURE',
  'CREATE_RESPONSE_REQUEST',
  'CREATE_RESPONSE_SUCCESS',
  'CREATE_RESPONSE_FAILURE',
  'LOAD_RESPONSE_REQUEST',
  'LOAD_RESPONSE_SUCCESS',
  'LOAD_RESPONSE_FAILURE',
  'LOAD_RESPONSE_EDIT_REQUEST',
  'LOAD_RESPONSE_EDIT_SUCCESS',
  'LOAD_RESPONSE_EDIT_FAILURE',
  'LOAD_RESPONSES_REQUEST',
  'LOAD_RESPONSES_SUCCESS',
  'LOAD_RESPONSES_FAILURE',
  'UPDATE_RESPONSE_REQUEST',
  'UPDATE_RESPONSE_SUCCESS',
  'UPDATE_RESPONSE_FAILURE',
  'UNSUBMIT_RESPONSE_REQUEST',
  'UNSUBMIT_RESPONSE_SUCCESS',
  'UNSUBMIT_RESPONSE_FAILURE',
  'LOAD_SURVEY_RESULTS_REQUEST',
  'LOAD_SURVEY_RESULTS_SUCCESS',
  'LOAD_SURVEY_RESULTS_FAILURE',
  'SURVEY_FORM_SHOW',
  'SURVEY_FORM_HIDE',
  'QUESTION_FORM_SHOW',
  'QUESTION_FORM_HIDE',
  'SECTION_FORM_SHOW',
  'SECTION_FORM_HIDE',
  'SHOW_DELETE_CONFIRMATION',
  'RESET_DELETE_CONFIRMATION',
  'SET_SURVEY_NOTIFICATION',
  'SET_DRAGGED_QUESTION',
  'REORDER_QUESTION',
  'CHANGE_QUESTION_SECTION',
  'UPDATE_QUESTION_ORDER_REQUEST',
  'UPDATE_QUESTION_ORDER_SUCCESS',
  'UPDATE_QUESTION_ORDER_FAILURE',
  'UPDATE_SECTION_ORDER_REQUEST',
  'UPDATE_SECTION_ORDER_SUCCESS',
  'UPDATE_SECTION_ORDER_FAILURE',
  'SEND_REMINDER_REQUEST',
  'SEND_REMINDER_SUCCESS',
  'SEND_REMINDER_FAILURE',
]);

export default actionTypes;

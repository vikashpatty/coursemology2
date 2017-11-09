/* eslint-disable import/no-unresolved, import/extensions, import/no-extraneous-dependencies */
import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/job-helpers';
/* eslint-enable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import actionTypes from '../constants';
import translations from '../translations';

const JOB_POLL_DELAY = 500;
const JOB_STAGGER_DELAY = 400;

export function setNotification(message, errors) {
  return {
    type: actionTypes.SET_NOTIFICATION,
    message,
    errors,
  };
}

/**
 * Prepares and maps answer value in the redux-form into server side format.
 * 1) In VoiceResponse, attribute answer.file is generated by component SingleFileInput.
 *    The data is in a format of { url, file, name }, and we only need to assign the file
 *    attribute into answer.file
 */
const formatAnswer = (answer) => {
  const newAnswer = { ...answer };
  // voice upload
  const fileObj = newAnswer.file;
  if (fileObj) {
    delete newAnswer.file;
    const { file } = fileObj;
    if (file) {
      newAnswer.file = file;
    }
  }
  return newAnswer;
};

const formatAnswers = (answers = []) => {
  const newAnswers = [];
  answers.forEach((answer) => {
    const newAnswer = formatAnswer(answer);
    newAnswers.push(newAnswer);
  });
  return newAnswers;
};

function buildErrorMessage(error) {
  if (!error || !error.response || !error.data) {
    return '';
  }

  if (typeof error.response.data.error === 'string') {
    return error.response.data.error;
  }

  return Object.values(error.response.data.errors).reduce(
    (flat, errors) => flat.concat(errors), []
  ).join(', ');
}

function getEvaluationResult(submissionId, answerId, questionId) {
  return (dispatch) => {
    CourseAPI.assessment.submissions.reloadAnswer(submissionId, { answer_id: answerId })
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.AUTOGRADE_SUCCESS,
          payload: data,
          questionId,
        });
      })
      .catch(() => {
        dispatch(setNotification(translations.requestFailure));
        dispatch({ type: actionTypes.AUTOGRADE_FAILURE, questionId });
      });
  };
}

export function fetchSubmission(id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.edit(id)
      .then(response => response.data)
      .then((data) => {
        data.answers.filter(a => a.autograding && a.autograding.path).forEach((answer, index) => {
          setTimeout(() => {
            pollJob(
              answer.autograding.path, JOB_POLL_DELAY,
              () => dispatch(getEvaluationResult(id, answer.fields.id, answer.questionId)),
              () => dispatch({ type: actionTypes.AUTOGRADE_FAILURE, questionId: answer.questionId })
            );
          }, JOB_STAGGER_DELAY * index);
        });

        dispatch({
          type: actionTypes.FETCH_SUBMISSION_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.FETCH_SUBMISSION_FAILURE }));
  };
}

export function autogradeSubmission(id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.autoGrade(id)
      .then(response => response.data)
      .then((data) => {
        pollJob(
          data.redirect_url, JOB_POLL_DELAY,
          () => {
            dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_SUCCESS });
            fetchSubmission(id)(dispatch);
            dispatch(setNotification(translations.autogradeSubmissionSuccess));
          },
          () => dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_FAILURE })
        );
      })
      .catch(() => dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_FAILURE }));
  };
}

export function saveDraft(submissionId, rawAnswers) {
  const answers = formatAnswers(rawAnswers);
  const payload = { submission: { answers } };
  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_DRAFT_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        if (data.redirect_url && data.format === 'html') {
          window.location = data.redirect_url;
        }
        dispatch({ type: actionTypes.SAVE_DRAFT_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.SAVE_DRAFT_FAILURE });
        dispatch(setNotification(translations.updateFailure, buildErrorMessage(error)));
      });
  };
}

export function finalise(submissionId, rawAnswers) {
  const answers = formatAnswers(rawAnswers);
  const payload = { submission: { answers, finalise: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.FINALISE_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        if (data.redirect_url && data.format === 'html') {
          window.location = data.redirect_url;
        }
        dispatch({ type: actionTypes.FINALISE_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.FINALISE_FAILURE });
        dispatch(setNotification(translations.updateFailure, buildErrorMessage(error)));
      });
  };
}

export function unsubmit(submissionId) {
  const payload = { submission: { unsubmit: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.UNSUBMIT_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UNSUBMIT_FAILURE });
        dispatch(setNotification(translations.updateFailure, buildErrorMessage(error)));
      });
  };
}

export function submitAnswer(submissionId, rawAnswer) {
  const answer = formatAnswer(rawAnswer);
  const payload = { answer };
  const questionId = answer.questionId;

  return (dispatch) => {
    dispatch({ type: actionTypes.AUTOGRADE_REQUEST, questionId });

    return CourseAPI.assessment.submissions.submitAnswer(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        if (data.redirect_url && data.format === 'html') {
          window.location = data.redirect_url;
        } else if (data.redirect_url) {
          pollJob(
            data.redirect_url, JOB_POLL_DELAY,
            () => dispatch(getEvaluationResult(submissionId, answer.id, questionId)),
            (errorData) => {
              dispatch({ type: actionTypes.AUTOGRADE_FAILURE, questionId, payload: errorData });
              dispatch(setNotification(translations.requestFailure));
            }
          );
        } else {
          dispatch({
            type: actionTypes.AUTOGRADE_SUCCESS,
            payload: data,
            questionId,
          });
        }
      })
      .catch(() => {
        dispatch({ type: actionTypes.AUTOGRADE_FAILURE, questionId });
        dispatch(setNotification(translations.requestFailure));
      });
  };
}

export function resetAnswer(submissionId, answerId, questionId) {
  const payload = { answer_id: answerId, reset_answer: true };
  return (dispatch) => {
    dispatch({ type: actionTypes.RESET_REQUEST, questionId });

    return CourseAPI.assessment.submissions.reloadAnswer(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.RESET_SUCCESS,
          payload: data,
          questionId,
        });
      })
      .catch(() => dispatch({ type: actionTypes.RESET_FAILURE, questionId }));
  };
}

export function saveGrade(submissionId, grades, exp, published) {
  const expParam = published ? 'points_awarded' : 'draft_points_awarded';
  const payload = {
    submission: {
      answers: grades,
      [expParam]: exp,
    },
  };

  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_GRADE_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.SAVE_GRADE_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.SAVE_GRADE_FAILURE });
        dispatch(setNotification(translations.updateFailure, buildErrorMessage(error)));
      });
  };
}

export function mark(submissionId, grades, exp) {
  const payload = {
    submission: {
      answers: grades,
      draft_points_awarded: exp,
      mark: true,
    },
  };

  return (dispatch) => {
    dispatch({ type: actionTypes.MARK_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.MARK_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.MARK_FAILURE });
        dispatch(setNotification(translations.updateFailure, buildErrorMessage(error)));
      });
  };
}

export function unmark(submissionId) {
  const payload = { submission: { unmark: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UNMARK_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.UNMARK_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UNMARK_FAILURE });
        dispatch(setNotification(translations.updateFailure, buildErrorMessage(error)));
      });
  };
}

export function publish(submissionId, grades, exp) {
  const payload = {
    submission: {
      answers: grades,
      draft_points_awarded: exp,
      publish: true,
    },
  };
  return (dispatch) => {
    dispatch({ type: actionTypes.PUBLISH_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.PUBLISH_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.PUBLISH_FAILURE });
        dispatch(setNotification(translations.updateFailure, buildErrorMessage(error)));
      });
  };
}

export function setRecording(payload = {}) {
  const { recordingComponentId } = payload;
  return dispatch => dispatch({ type: actionTypes.RECORDER_SET_RECORDING, payload: { recordingComponentId } });
}

export function setNotRecording() {
  return dispatch => dispatch({ type: actionTypes.RECORDER_SET_UNRECORDING });
}

export function recorderComponentMount() {
  return dispatch => dispatch({ type: actionTypes.RECORDER_COMPONENT_MOUNT });
}

export function recorderComponentUnmount() {
  return dispatch => dispatch({ type: actionTypes.RECORDER_COMPONENT_UNMOUNT });
}

export function enterStudentView() {
  return (dispatch) => {
    dispatch({ type: actionTypes.ENTER_STUDENT_VIEW });
  };
}

export function exitStudentView() {
  return (dispatch) => {
    dispatch({ type: actionTypes.EXIT_STUDENT_VIEW });
  };
}

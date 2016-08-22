# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_submission, class: Course::Assessment::Submission,
                                         parent: :course_experience_points_record,
                                         aliases: [:submission] do
    transient do
      grader { User.stamper }
      auto_grade true # Used only with any of the submitted or finalised traits.
      creator
    end
    assessment { build(:assessment, course: course) }

    trait :attempting do
      after(:build) do |submission|
        submission.assessment.questions.attempt(submission).each(&:save!)
      end
    end

    trait :submitted do
      attempting
      after(:build) do |submission, evaluator|
        submission.finalise!
        answer.send(:clear_attribute_changes, :workflow_state) unless evaluator.auto_grade
      end
    end

    trait :graded do
      submitted
      after(:build) do |submission, evaluator|
        submission.answers.each do |answer|
          answer.grade = Random::DEFAULT.rand(answer.question.maximum_grade)
          answer.grader = evaluator.grader
        end

        # Revert publisher and published at if given.
        submission.publish!
        submission.publisher = evaluator.publisher if evaluator.publisher
        submission.published_at = evaluator.published_at if evaluator.published_at
      end
    end
  end
end

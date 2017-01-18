# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Submission do
  it { is_expected.to act_as(Course::ExperiencePointsRecord) }
  it { is_expected.to belong_to(:video).inverse_of(:submissions) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:student) { create(:course_student, course: course) }
    let!(:other_student) { create(:course_student, course: course) }
    let(:video) { create(:video, course: course) }
    let(:submission1) { create(:video_submission, video: video, creator: student.user) }
    let(:submission2) { create(:video_submission, video: video, creator: other_student.user) }

    describe 'validations' do
      context 'when the course user is different from the submission creator' do
        subject do
          build(:video_submission, video: video, course_user: other_student,
                                   creator: student.user)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:experience_points_record]).
            to include(I18n.
              t('activerecord.errors.models.course/video/submission.'\
                'attributes.experience_points_record.inconsistent_user'))
        end
      end

      context 'when a submission for the user and video already exists' do
        before { submission1 }
        subject { build(:video_submission, video: video, creator: student.user) }

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:base]).
            to include(I18n.
              t('activerecord.errors.models.course/video/submission.'\
                'submission_already_exists'))
        end
      end
    end

    describe '.by_user' do
      before do
        submission1
        submission2
      end

      it "only returns the selected user's submissions" do
        expect(video.submissions.by_user(student.user).empty?).to be(false)
        expect(video.submissions.by_user(student.user).
          all? { |submission| submission.course_user.user == student.user }).to be(true)
      end
    end

    describe 'callbacks from Course::Video::Submission::TodoConcern' do
      before { submission1 }
      let(:todo) do
        Course::LessonPlan::Todo.
          find_by(item_id: video.lesson_plan_item.id, user_id: student.user.id)
      end

      context 'when the submission is created' do
        it 'sets the todo to completed' do
          expect(todo.completed?).to be_truthy
        end
      end

      context 'when the submission is destroyed' do
        it 'sets the todo state to not started' do
          submission1.destroy
          expect(todo.not_started?).to be_truthy
        end
      end
    end
  end
end
# Represents a user in the application. Users are shared across all instances.
class User < ActiveRecord::Base
  include UserAuthenticationConcern
  model_stamper
  acts_as_reader

  enum role: { normal: 0, administrator: 1 }

  has_many :emails, class_name: UserEmail.name, inverse_of: :user, dependent: :destroy
  has_many :instance_users
  has_many :instances, through: :instance_users
  has_many :course_users, inverse_of: :user, dependent: :destroy
  has_many :courses, through: :course_users
  has_many :course_group_users, inverse_of: :user, dependent: :destroy,
                                class_name: Course::GroupUser.name
  has_many :course_groups, through: :course_group_users, class_name: Course::Group.name

  accepts_nested_attributes_for :emails

  # Gets the email address of the user.
  #
  # @return [String, nil] The email address of the user.
  def email
    result_record = default_email_record
    default_email_record.email if result_record
  end

  # Sets the default email address of the user.
  #
  # @param email [String, nil] The email address of the user to set. Nil unsets the record.
  def email=(email)
    record = default_email_record
    if email
      record ||= emails.build
      record.email = email
      record.primary = true
    elsif email.nil? && record
      record.mark_for_destruction
    end
  end

  private

  # Gets the default email address record.
  #
  # @return [UserEmail] The user's primary email address record.
  def default_email_record
    valid_emails = emails.each.select { |email_record| !email_record.marked_for_destruction? }
    result = valid_emails.find(&:primary?)
    result ||= valid_emails.first
    result ||= emails.order('primary=1 ASC').first
    result
  end
end

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Mail, Book, Video, FileText, ExternalLink, Send, MessageSquare, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const SupportPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    subject: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const subjectOptions = [
    { value: '', label: t('support.selectSubject') },
    { value: 'bug', label: t('support.bugReport') },
    { value: 'feature', label: t('support.featureRequest') },
    { value: 'contact', label: t('support.contact') },
    { value: 'other', label: t('support.other') }
  ];

  const supportResources = [
    {
      icon: Book,
      title: t('support.resources.documentation'),
      description: t('support.resources.documentationDesc'),
      link: 'https://doc.phantomguard.io/',
      linkText: t('support.resources.viewDocs')
    },
    {
      icon: Video,
      title: t('support.resources.videoTutorials'),
      description: t('support.resources.videoDesc'),
      link: 'https://doc.phantomguard.io/',
      linkText: t('support.resources.watchVideos')
    },
    {
      icon: FileText,
      title: t('support.resources.knowledgeBase'),
      description: t('support.resources.kbDesc'),
      link: 'https://doc.phantomguard.io/',
      linkText: t('support.resources.browseKB')
    },
    {
      icon: MessageSquare,
      title: t('support.resources.community'),
      description: t('support.resources.communityDesc'),
      link: 'https://doc.phantomguard.io/',
      linkText: t('support.resources.joinForum')
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t('support.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('support.errors.emailInvalid');
    }

    if (!formData.name.trim()) {
      newErrors.name = t('support.errors.nameRequired');
    }

    if (!formData.subject) {
      newErrors.subject = t('support.errors.subjectRequired');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('support.errors.descriptionRequired');
    } else if (formData.description.trim().length < 10) {
      newErrors.description = t('support.errors.descriptionMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const subject = encodeURIComponent(formData.subject || 'Support Request');
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nVersion: free-pg\n\nDescription:\n${formData.description}`
      );
      window.location.href = `mailto:support@phantomguard.io?subject=${subject}&body=${body}`;
      setSubmitSuccess(true);
      toast.success(t('support.emailClientOpened', { defaultValue: 'Your email client will open to send the message.' }));
      setTimeout(() => {
        setFormData({ email: '', name: '', subject: '', description: '' });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setErrors({ submit: error.message || t('support.errors.submitFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user starts typing
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
        <HelpCircle className="w-5 h-5" />
        <span>{t('support.title')}</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Contact Form */}
        <div className="phguard-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t('support.contactUs')}
          </h3>

          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('support.successMessage')}
              </p>
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                {errors.submit}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support.email')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`phguard-input ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder={t('support.emailPlaceholder')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support.name')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`phguard-input ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder={t('support.namePlaceholder')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Subject Dropdown */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support.subject')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`phguard-input ${errors.subject ? 'border-red-500 dark:border-red-500' : ''}`}
              >
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
              )}
            </div>

            {/* Description Textarea */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support.description')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`phguard-input resize-none ${errors.description ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder={t('support.descriptionPlaceholder')}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('support.minCharacters')}
                  </p>
                )}
                <p className={`text-xs ${formData.description.length >= 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formData.description.length}/10
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="phguard-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t('support.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('support.sendMessage')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Support Resources */}
        <div className="phguard-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t('support.resources.title')}
          </h3>

          <div className="space-y-4">
            {supportResources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <a
                  key={index}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <IconComponent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                        <span>{resource.linkText}</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Additional Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('support.needMoreHelp')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {t('support.responseTime')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;


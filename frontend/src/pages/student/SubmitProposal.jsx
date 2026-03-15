import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitProjectProposal,
  generateInviteCode,
} from "../../store/slices/studentSlice";
import { Copy } from "lucide-react";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    //TODO: other fields if necessary
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const { inviteCode, inviteCodeExpiresAt } = useSelector(
    (state) => state.student,
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(submitProjectProposal(formData)).unwrap();
      setFormData({
        title: "",
        description: "",
      });
      setSubmitted(true);
    } catch (error) {
      // Error handling is done in the thunk
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvite = () => {
    dispatch(generateInviteCode());
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Submit Project Proposal</h1>
            <p className="card-subtitle">
              Please fill out the form below to submit your project proposal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="label">Project Title </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter Your Project Title"
              required
            />

            <label className="label">Project Description </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[120px]"
              placeholder="Provide a brief description of your project"
              required
            ></textarea>

            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit Proposal"}
              </button>
            </div>
          </form>
        </div>

        {/* Post-submit invite partner prompt */}
        {submitted && (
          <div className="card border-2 border-blue-200">
            <div className="card-header">
              <h2 className="card-title">Invite Your Partner</h2>
              <p className="card-subtitle">
                Your proposal has been submitted! Generate an invite code and
                share it with your partner so they can join your group.
              </p>
            </div>
            <div className="p-4 space-y-4">
              <button
                onClick={handleGenerateInvite}
                className="btn btn-primary w-full"
              >
                Generate Invite Code
              </button>
              {inviteCode && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                    <code className="flex-1 font-mono text-lg text-center tracking-widest">
                      {inviteCode}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-slate-200 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {inviteCodeExpiresAt && (
                    <p className="text-xs text-slate-500 text-center">
                      Expires: {new Date(inviteCodeExpiresAt).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 text-center">
                    Share this code with your partner. They can use it from
                    their dashboard to join your group.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SubmitProposal;

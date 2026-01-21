import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitProjectProposal } from "../../store/slices/studentSlice";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    //TODO: other fields if necessary
  });

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

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
    } catch (error) {
      // Error handling is done in the thunk
    } finally {
      setIsLoading(false);
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
      </div>
    </>
  );
};

export default SubmitProposal;

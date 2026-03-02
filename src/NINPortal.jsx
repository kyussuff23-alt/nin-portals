import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function NINPortal() {
  const [step, setStep] = useState("landing");
  const [nin, setNin] = useState("");
  const [formData, setFormData] = useState({
    policynumber: "",
    fullname: "",
    gender: "",
    dateofbirth: ""
  });
  const [alert, setAlert] = useState(null);
  const [fieldsEnabled, setFieldsEnabled] = useState(false);

  // Auto-dismiss alerts after 10 seconds with fade-out
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        const alertElement = document.querySelector('.alert');
        if (alertElement) {
          alertElement.classList.remove('show');
          setTimeout(() => setAlert(null), 500);
        } else {
          setAlert(null);
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setNin("");
    setFormData({ policynumber: "", fullname: "", gender: "", dateofbirth: "" });
    setFieldsEnabled(false);
  };

  const checkNIN = async (value) => {
    if (value.length === 11) {
      const { data: existing, error } = await supabase
        .from("mynin")
        .select("nin")
        .eq("nin", value);

      if (error) {
        setAlert({ type: "danger", message: "Error checking NIN." });
        setFieldsEnabled(false);
        return;
      }

      if (existing && existing.length > 0) {
        setAlert({ type: "danger", message: "NIN already exists." });
        clearForm();   // ✅ clears the form immediately
      } else {
        setAlert(null);
        setFieldsEnabled(true);
      }
    } else {
      setFieldsEnabled(false);
    }
  };

  const submitToSupabase = async () => {
    const { error } = await supabase.from("mynin").insert([
      {
        nin,
        policynumber: formData.policynumber,
        fullname: formData.fullname,
        gender: formData.gender,
        dateofbirth: formData.dateofbirth
      }
    ]);

    if (error) {
      setAlert({ type: "danger", message: "NIN already exists." });
      clearForm();   // ✅ clears all fields immediately after error
    } else {
      setAlert({ type: "success", message: "Record submitted successfully!" });
      clearForm();
      setStep("landing");
    }
  };

  return (
    <div className="gradient-bg min-vh-100 d-flex justify-content-center align-items-center">
      <div className="container">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`} role="alert">
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            {step === "landing" && (
              <div className="card shadow-lg border-0 rounded-4">
                <div className="text-center mt-3">
                  <img src="/nonsuch.jpg" alt="NONSUCH Logo" style={{ maxHeight: "80px" }} />
                  <h2 className="portal-header mt-2">NONSUCH NIN SUBMISSION PORTAL</h2>
                </div>
                <div className="card-body text-center p-4 p-md-5">
                  <div className="alert alert-info text-start rounded-3">
                    <p>
                      The Federal Government of Nigeria, through the National Health Insurance Authority (NHIA), 
                      has mandated all Health Maintenance Organizations (HMOs) to implement the use of the 
                      National Identification Number (NIN) as a prerequisite for health insurance subscription.
                    </p>
                    <p>
                      This directive is designed to ensure proper identification and to facilitate the subsequent 
                      issuance of health insurance policy certificates.
                    </p>
                    <p>
                      As a valued NONSUCH subscriber, we have observed that your NIN is not yet available in our records. 
                      Kindly click the forward arrow below to continue and submit your details.
                    </p>
                    <p>Thank you for your time.</p>
                  </div>
                  <div className="text-center mt-4">
                    <button 
                      className="btn border-0 shadow-none d-inline-flex align-items-center justify-content-center fs-3 portal-btn" 
                      onClick={() => setStep("form")}
                    >
                      <span className="me-2">Continue</span> ➡️
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === "form" && (
              <div className="card shadow-lg border-0 rounded-4">
                <div className="text-center mt-3">
                  <img src="/nonsuch.jpg" alt="NONSUCH Logo" style={{ maxHeight: "80px" }} />
                  <h2 className="portal-header mt-2">NONSUCH NIN SUBMISSION PORTAL</h2>
                </div>
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title text-primary fw-bold mb-0">Submit Your NIN Details</h4>
                    <div className="text-center">
                      <button 
                        className="btn border-0 shadow-none d-inline-flex align-items-center justify-content-center fs-3 portal-btn" 
                        onClick={() => setStep("landing")}
                      >
                        ⬅️ <span className="ms-2">Back</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    submitToSupabase();
                  }}>
                    <input
                      type="number"
                      className="form-control mb-3"
                      placeholder="Enter your 11-digit NIN"
                      required
                      value={nin}
                      onChange={(e) => {
                        setNin(e.target.value);
                        checkNIN(e.target.value);
                      }}
                    />
                    <input
                      className="form-control mb-3"
                      name="policynumber"
                      placeholder="Policy Number"
                      required
                      value={formData.policynumber}
                      onChange={handleFormChange}
                      disabled={!fieldsEnabled}
                    />
                    <input
                      className="form-control mb-3"
                      name="fullname"
                      placeholder="Full Name"
                      required
                      value={formData.fullname}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(value)) {
                          handleFormChange(e);
                        }
                      }}
                      disabled={!fieldsEnabled}
                    />

                    <select
                      className="form-select form-select-lg mb-3"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleFormChange}
                      disabled={!fieldsEnabled}
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male ♂</option>
                      <option value="Female">Female ♀</option>
                      <option value="Other">Other ⚧</option>
                    </select>

                    <DatePicker
                      selected={formData.dateofbirth ? new Date(formData.dateofbirth) : null}
                      onChange={(date) => setFormData({ ...formData, dateofbirth: date })}
                      className="form-control form-control-lg mb-3 w-100"
                      placeholderText="Select your date of birth"
                      dateFormat="dd MMMM yyyy"
                      required
                      disabled={!fieldsEnabled}
                    />

                    <button 
                      className="btn btn-success w-100 rounded-pill shadow-sm" 
                      type="submit" 
                      disabled={!fieldsEnabled}
                    >
                      Send to NONSUCH
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NINPortal;

import { useNavigate } from "react-router-dom";
import "./NotFoud.css";
import { Button } from "antd";
export default function NotFoud() {
  const nav = useNavigate();

  const handleClick = () => {
    nav(`/home`);
  };
  return (
    <div>
      <section class="page_404">
        <div class="container">
          <div class="row">
            <div class="col-sm-12 ">
              <div class="col-sm-10 col-sm-offset-1  text-center">
                <div class="four_zero_four_bg">
                  <h1 class="text-center ">404</h1>
                </div>

                <div class="contant_box_404" style={{ marginTop: "10px" }}>
                  <h3 class="h2">Look like you're lost</h3>

                  <p>the page you are looking for not avaible!</p>

                  <Button
                    class="link_404"
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "#39ac31",
                      color: "white",
                      width: "200px",
                      height: "40px",
                    }}
                    onClick={() => handleClick()}
                  >
                    <span style={{ fontWeight: "bold" }}> Go to Home</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

(function() {
    let $ = document.getElementById.bind(document);

    var lockPrevelance = true;

    function getPrevelance(specificity, sensitivity) {
        if (lockPrevelance) {
            return $("prevelance").valueAsNumber / 100.0;
        } else {
            // STEVE'S EQUATION: prevelance = (positive tests + specificity - 1)/(sensitivity + specificity - 1)

            // positive_tests = false_positive_rate + true_positive_rate
            // positive_tests = (1.0 - specificity) * (1.0 - prevelance) + sensitivity * prevelance
            // positive_tests =  1  + specificity * prevelacne - specificity - prevelance + sensitivity * prevelance
            // = 1 + prevelance (spec + sens - 1) - specificity
            //
            // positive_tests + specificity - 1 = prevelance (spec + sens - 1)
            // prevelance = (positive_tests + specificity - 1) / (spec + sens - 1)

            let positive_tests = $("positive_percent").valueAsNumber / 100.0;

            return (positive_tests + specificity - 1.0)/(sensitivity + specificity - 1.0);
        }
    }

    function calculateOutputs() {
        let sensitivity = $("sensitivity").valueAsNumber / 100.0;
        let specificity = $("specificity").valueAsNumber / 100.0;
        let prevelance = getPrevelance(specificity, sensitivity);

        let true_positive_rate = sensitivity * prevelance;
        let true_negative_rate = specificity * (1.0 - prevelance);

        let false_positive_rate = (1.0 - specificity) * (1.0 - prevelance);
        let false_negative_rate = (1.0 - sensitivity) * prevelance;

        let probability_given_positive = (true_positive_rate) / (true_positive_rate + false_positive_rate);
        let probability_given_negative = (false_negative_rate) / (true_negative_rate + false_negative_rate);

        $("positive_likelihood").value = (probability_given_positive * 100).toFixed(2).toString();
        $("negative_likelihood").value = (probability_given_negative * 100).toFixed(2).toString();

        if (lockPrevelance) {
            let positive_tests = true_positive_rate + false_positive_rate;
            $("positive_percent").value = (positive_tests * 100).toFixed(2).toString();
        } else {
            $("prevelance").value = (prevelance * 100).toFixed(2).toString();
        }
    }

    function updateUrlState() {
        let sensitivity = $("sensitivity").value;
        let specificity = $("specificity").value;
        let prevelance = $("prevelance").value;

        history.replaceState(null, "Specificity and Sensitivity Calculator", 
            `?sensitivity=${sensitivity}&specificity=${specificity}&prevalence=${prevelance}`);
    }

    function parseUrlValues() {
        let params = new URLSearchParams(window.location.search);

        if (params.has("sensitivity")) {
            $("sensitivity").value = params.get("sensitivity");
        }

        if (params.has("specificity")) {
            $("specificity").value = params.get("specificity");
        }

        if (params.has("prevalence")) {
            $("prevelance").value = params.get("prevalence");
        }
    }

    function updateState() {
        calculateOutputs();
        updateUrlState();
    }


    document.addEventListener("DOMContentLoaded", () => {
        $("sensitivity").addEventListener("change", updateState);
        $("specificity").addEventListener("change", updateState);
        $("prevelance").addEventListener("change", () => {
            lockPrevelance = true;
            updateState();
        });

        $("positive_percent").addEventListener("change", () => {
            lockPrevelance = false;
            updateState();
        });

        parseUrlValues();
        calculateOutputs();
    });
})()
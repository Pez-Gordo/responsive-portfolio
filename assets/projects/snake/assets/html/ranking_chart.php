<?php
include_once '../php/consultar.php';
?>

<!Doctype html>
<html>
<body>
    <?php
        
        $sql = "SELECT * from snake order by score desc;";
        $result = mysqli_query($conn, $sql);
        $resultCheck = mysqli_num_rows($result);
        echo "Result ----> " . $result;
        if ($resultCheck > 0) {    
            echo "<table border='1'>";
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<tr><td>" . $row['usuario'] . "</td><td>" . $row['score'] . "</td><td>" . $row['say'] . "</td></tr>";
            }
            echo "</table>";
        } 
        
       
    ?>
<br><br>
<a href="../../index.html">Play again</a> 
</body>
</html>










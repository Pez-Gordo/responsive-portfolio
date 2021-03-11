<?php

$host = "localhost";
$username = "root";
$password = "my*8-9+6POiusql";
$database = "ranking";
$conn = mysqli_connect($host, $username, $password, $database);

$query = "SELECT * FROM snake ORDER BY score DESC";

$results = $conn->query($query);

// Almacena en $resultCheck el número de filas de la consulta
$resultCheck=mysqli_num_rows($results);

if ($resultCheck > 0) {
    $rawData = array();
    $i = 0;
    while($data = $results->fetch_array()) {
        $rawData[$i] = $data;
        $i++;    
    }    

    exit(json_encode($rawData));
} 

mysqli_close($conn);

?>
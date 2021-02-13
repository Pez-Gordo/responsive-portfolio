<?php 

	// Making the database connection

	$conexion=mysqli_connect('localhost','root','my*8-9+6POiusql','ranking');

	if (!$conexion) {
		echo "Error: No se pudo conectar a MySQL." . PHP_EOL;
		echo "errno de depuración: " . mysqli_connect_errno() . PHP_EOL;
		echo "error de depuración: " . mysqli_connect_error() . PHP_EOL;
		exit;
	}

	echo "Connection successful! " . PHP_EOL;
	echo "Info host: " . mysqli_get_host_info($conexion) . PHP_EOL;

	// Getting the data and making an insert into snake table
	
	$usuario=$_POST['usuario'];
	$say=$_POST['say'];
	$score=$_POST['score'];

	$sql="INSERT into snake (usuario,say,score) values ('$usuario','$say','$score')";

	echo mysqli_query($conexion,$sql);

	mysqli_close($conexion);
 ?>
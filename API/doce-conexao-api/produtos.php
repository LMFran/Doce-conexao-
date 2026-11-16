
<?php

header("Content-Type: application/json; charset=UTF-8");

try {
    
    $conexao = new PDO(
        "mysql:host=localhost;dbname=doce_conexao;charset=utf8mb4",
        "root",
        ""
    );

    $conexao->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    
    $sql = "SELECT * FROM produtos WHERE ativo = 1";

    $consulta = $conexao->query($sql);
    $produtos = $consulta->fetchAll(PDO::FETCH_ASSOC);

    
    echo json_encode($produtos, JSON_UNESCAPED_UNICODE);

} catch (PDOException $erro) {
    http_response_code(500);
    error_log($erro->getMessage());

    echo json_encode([
        "erro" => "Não foi possível consultar os produtos."
    ]);
}
?>
